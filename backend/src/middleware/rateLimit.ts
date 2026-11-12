import rateLimit, { type Options } from "express-rate-limit";
import config from "../config";

// Rate limits for the two public endpoints a person can abuse by repetition:
// admin login (password guessing) and the contact form (every accepted
// message sends an email).
//
// Each endpoint gets two limiters, run in order:
//
//   1. Per client IP. The normal case. The IP comes from `req.ip`, which is
//      only the visitor's address because app.ts sets `trust proxy` to the
//      number of proxies in front of us (config.trustProxyHops — Vercel's
//      rewrite, then Fly's edge).
//   2. Global, one bucket for everyone. A backstop, because the per-IP key
//      can be dodged: anyone who calls the Fly hostname directly, skipping
//      Vercel, can put any address they like in X-Forwarded-For. The global
//      cap still bounds the total. For login the cost is that a sustained
//      attack can also lock the admin out until the window rolls over —
//      acceptable on a single-admin site, and better than unbounded guessing.
//
// Counters live in memory, per process. With one Fly machine that is exact;
// if the app ever scales out, each machine counts separately and the
// effective limit multiplies by the machine count.
//
// Responses keep the API envelope so the frontend's ApiError carries the
// message, rather than the library's default plain-text body.

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;

function tooMany(error: string): Pick<Options, "message" | "statusCode"> {
  return { statusCode: 429, message: { success: false, error } };
}

// One bucket regardless of who is asking. The library only calls this to
// name the bucket, so a constant is the whole point.
const everyone = () => "global";

const shared = {
  standardHeaders: "draft-8",
  legacyHeaders: false,
} as const;

// Only failed attempts count, so signing in successfully never uses up the
// allowance — the admin can't lock themselves out by logging in often.
export const loginLimiters = [
  rateLimit({
    ...shared,
    windowMs: FIFTEEN_MINUTES,
    limit: config.rateLimit.loginPerIp,
    skipSuccessfulRequests: true,
    ...tooMany("Too many login attempts. Try again in 15 minutes."),
  }),
  rateLimit({
    ...shared,
    windowMs: FIFTEEN_MINUTES,
    limit: config.rateLimit.loginGlobal,
    skipSuccessfulRequests: true,
    keyGenerator: everyone,
    ...tooMany("Login is temporarily unavailable. Try again in 15 minutes."),
  }),
];

// Every request counts here, accepted or not: a message that fails
// validation costs nothing to send, so it shouldn't be free to repeat.
export const contactLimiters = [
  rateLimit({
    ...shared,
    windowMs: ONE_HOUR,
    limit: config.rateLimit.contactPerIp,
    ...tooMany("Too many messages from your connection. Try again in an hour."),
  }),
  rateLimit({
    ...shared,
    windowMs: ONE_HOUR,
    limit: config.rateLimit.contactGlobal,
    keyGenerator: everyone,
    ...tooMany("The contact form is busy. Try again in an hour."),
  }),
];
