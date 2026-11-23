import express, {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";

// Where browsers send content security policy violations for rowan.page.
//
// The policy (vercel.json) is report-only to begin with: it blocks nothing,
// and every load it *would* have blocked is reported here. Enforcing it is
// safe once these logs have been quiet for a while across real visits, the
// rollout the design doc sets out (5.2, risk "Strict CSP breaks pages").
//
// Logged, not stored. A report is diagnostic, wanted for weeks at most, and
// a visitor's browser extensions produce a steady background of them that
// nobody will ever act on. Fly's logs keep that long enough to read and then
// drop it, so there's no collection, no retention rule, and nothing to
// clean up. For the same reason there's no rate limit: a flood can cost log
// lines, but not storage, email, or a database write.
//
// Browsers send two formats, and this accepts both:
//   report-uri  application/csp-report     { "csp-report": { ... } }
//                (Safari, Firefox, older Chrome)
//   report-to   application/reports+json   [ { type, body: { ... } } ]
//                (Chrome and Edge, via the Reporting-Endpoints header)

// Same ceiling as the analytics intake: a real report is well under 1kb.
const parseReport = express.json({
  type: ["application/csp-report", "application/reports+json"],
  limit: "16kb",
});

// A body that doesn't parse (or is too big) is dropped rather than passed to
// the error handler as a 400; see the handler below for why.
function readReport(req: Request, res: Response, next: NextFunction): void {
  parseReport(req, res, (error?: unknown) => {
    if (error) req.body = undefined;
    next();
  });
}

// The fields worth reading, clipped so one report is one short log line
// even when a blocked URL is a long data: URI, and with control characters
// flattened, since anyone can post here and a newline in a "URL" would
// otherwise write a second, forged line into the log.
const FIELD_MAX = 200;

interface Violation {
  directive: string;
  blocked: string;
  page: string;
  source: string;
  disposition: string;
}

const clip = (value: unknown): string =>
  typeof value === "string"
    ? // eslint-disable-next-line no-control-regex -- matching them is the point
      value.slice(0, FIELD_MAX).replace(/[\u0000-\u001f\u007f]/g, " ")
    : "";

function violations(body: unknown): Violation[] {
  // report-to: a batch, possibly mixed with other report types.
  if (Array.isArray(body)) {
    return body
      .filter(
        (report): report is { type: string; body: Record<string, unknown> } =>
          report?.type === "csp-violation" && typeof report.body === "object"
      )
      .map(({ body: r }) => ({
        directive: clip(r.effectiveDirective),
        blocked: clip(r.blockedURL),
        page: clip(r.documentURL),
        source: clip(r.sourceFile),
        disposition: clip(r.disposition),
      }));
  }
  // report-uri: one violation.
  const report =
    typeof body === "object" && body !== null
      ? (body as { "csp-report"?: Record<string, unknown> })["csp-report"]
      : undefined;
  if (!report || typeof report !== "object") return [];
  return [
    {
      directive: clip(
        report["effective-directive"] ?? report["violated-directive"]
      ),
      blocked: clip(report["blocked-uri"]),
      page: clip(report["document-uri"]),
      source: clip(report["source-file"]),
      disposition: clip(report.disposition),
    },
  ];
}

const router = Router();

// 204 whatever arrives, malformed included: the sender is a browser that
// can't act on an error, and a 400 would only add a console message to a
// visitor's page.
router.post("/", readReport, (req: Request, res: Response) => {
  for (const v of violations(req.body)) {
    console.warn(
      `[csp] ${v.disposition || "report"} ${v.directive} blocked=${v.blocked || "-"} ` +
        `page=${v.page || "-"} source=${v.source || "-"}`
    );
  }
  res.status(204).end();
});

export default router;
