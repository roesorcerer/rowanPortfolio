import type { Request, Response, CookieOptions } from "express";
import jwt from "jsonwebtoken";
import config from "../config";

// The admin session travels in this cookie, not in an Authorization header
// the frontend attaches. That is the point of it: the token used to sit in
// localStorage, where any script running on the page could read it, so one
// XSS meant a stolen week-long session. HttpOnly puts it out of JavaScript's
// reach entirely; the browser sends it and nothing else ever sees it.
//
// Why it only works on a same-site API host: the frontend is rowan.page and
// the API must be api.rowan.page, not rowan-portfolio-api.fly.dev. fly.dev is
// on the Public Suffix List, so a cookie from it is a third-party cookie on
// rowan.page, which Safari blocks outright and other browsers are steadily
// restricting. A subdomain of rowan.page is the same site, so the cookie is
// first-party everywhere and SameSite=Strict still lets it through.
//
// SameSite=Strict is also the CSRF defence. A page on any other site cannot
// make the browser send this cookie, so a forged form post or link arrives
// unauthenticated. Same-site but cross-origin requests (rowan.page calling
// api.rowan.page) still carry it, and CORS restricts those to CORS_ORIGIN.
export const SESSION_COOKIE = "admin_session";

// Path=/api keeps it off anything the API host might serve outside the API.
// Secure is dropped only in development, where the Vite proxy serves plain
// http on localhost and Safari would refuse a Secure cookie there.
function baseOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: "strict",
    path: "/api",
  };
}

// The cookie expires when the token does, read back off the signed token so
// JWT_EXPIRES_IN stays the one setting for session length. A cookie that
// outlived its token would only ever produce 401s.
export function setSessionCookie(res: Response, token: string): void {
  const decoded = jwt.decode(token);
  const exp =
    decoded && typeof decoded === "object" && typeof decoded.exp === "number"
      ? decoded.exp
      : undefined;
  res.cookie(SESSION_COOKIE, token, {
    ...baseOptions(),
    ...(exp === undefined ? {} : { expires: new Date(exp * 1000) }),
  });
}

// The browser only clears a cookie whose path, SameSite and Secure match the
// one it holds, hence the same options.
export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE, baseOptions());
}

// Reads the one cookie this API uses, so it doesn't need cookie-parser for
// it. A JWT is base64url and dots, so no percent-decoding is needed; a value
// that isn't one simply fails verification like any other bad token.
export function readSessionCookie(req: Request): string | undefined {
  const header = req.headers.cookie;
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() === SESSION_COOKIE) {
      const value = part.slice(eq + 1).trim();
      return value === "" ? undefined : value;
    }
  }
  return undefined;
}
