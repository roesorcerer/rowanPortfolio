import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

// The site's security headers live in vercel.json, which can't hold
// comments, so the reasons for the content security policy are here, next
// to the checks that keep it true. Design doc 5.2 and 8.2 (A02).
//
// It is Content-Security-Policy-Report-Only for now: browsers enforce
// nothing and report what they would have blocked to /api/csp-report,
// which logs it on Fly (backend/src/routes/csp-report.routes.ts). Once
// those logs stay quiet, rename the header to Content-Security-Policy.
//
//   script-src 'self' + one hash  The bundles, plus the theme script inline
//                                 in index.html. Nothing else inline runs:
//                                 the hydration state and JSON-LD blocks are
//                                 data (type application/json and ld+json),
//                                 which script-src doesn't govern. No nonce,
//                                 because the pages are static files.
//   style-src 'unsafe-inline'     React writes style="" attributes into the
//                                 prerendered HTML (the resume, the stairs),
//                                 and CSS can't run script, so this costs
//                                 little.
//   img-src / media-src https:    A project's media can be any URL the admin
//                                 pastes.
//   connect-src api.rowan.page    The API client and analytics call Fly
//                                 directly (VITE_API_URL), not through
//                                 Vercel's /api rewrite.

const frontend = path.resolve(__dirname, "..");
const read = (file: string) => readFileSync(file, "utf8");

interface VercelConfig {
  headers?: { source: string; headers: { key: string; value: string }[] }[];
}

const rootConfig: VercelConfig = JSON.parse(
  read(path.join(frontend, "..", "vercel.json"))
);
const frontendConfig: VercelConfig = JSON.parse(
  read(path.join(frontend, "vercel.json"))
);

function header(config: VercelConfig, key: string): string {
  const value = config.headers
    ?.find((rule) => rule.source === "/(.*)")
    ?.headers.find((h) => h.key === key)?.value;
  if (!value) throw new Error(`vercel.json has no ${key} for every path`);
  return value;
}

const policy = header(rootConfig, "Content-Security-Policy-Report-Only");

describe("security headers", () => {
  // Which of the two files Vercel reads depends on the project's root
  // directory setting, so they have to say the same thing (CODEBASE.md).
  it("are the same in both vercel.json files", () => {
    expect(frontendConfig.headers).toEqual(rootConfig.headers);
  });

  // Editing the theme script in index.html changes its hash. Without this,
  // the policy would silently stop matching it, which is harmless while
  // report-only and blanks the theme once enforced.
  it("allow every inline script in index.html by its hash", () => {
    const html = read(path.join(frontend, "index.html"));
    const inline = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
    expect(inline.length).toBeGreaterThan(0);
    for (const [, body] of inline) {
      const hash = createHash("sha256")
        .update(body ?? "")
        .digest("base64");
      expect(policy).toContain(`'sha256-${hash}'`);
    }
  });

  it("let nothing else inline run as script", () => {
    const scriptSrc = policy
      .split(";")
      .map((d) => d.trim())
      .find((d) => d.startsWith("script-src "));
    expect(scriptSrc).not.toContain("'unsafe-inline'");
    expect(scriptSrc).not.toContain("'unsafe-eval'");
  });
});
