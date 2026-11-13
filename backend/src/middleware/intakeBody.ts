import express, { Request, Response, NextFunction } from "express";

// Lets the analytics intake routes accept their JSON body sent as text/plain.
//
// The browser posts page views and events straight to the Fly hostname
// (VITE_API_URL), which is cross-origin from rowan.page. A cross-origin POST
// with Content-Type: application/json is not a "simple" request, so the
// browser sends an OPTIONS preflight first: two round trips for every page
// view. And navigator.sendBeacon, which link clicks use so the request
// survives the page unloading, can't reliably carry a preflighted type
// cross-origin at all. text/plain is CORS-safelisted, so neither problem
// arises, and the body is still the same JSON string.
//
// express.json() (in app.ts) has already handled any application/json body,
// so older clients and tests that send JSON keep working; this only reads a
// text/plain one. The limit is far above any real page view or event — the
// fields are capped at a few hundred characters — and far below the 512kb the
// project editor needs, which has no business applying to a public endpoint.
const readText = express.text({ type: "text/plain", limit: "16kb" });

function parseText(req: Request, _res: Response, next: NextFunction): void {
  if (typeof req.body !== "string") {
    next();
    return;
  }
  try {
    req.body = JSON.parse(req.body);
    next();
  } catch {
    next(Object.assign(new Error("Body is not valid JSON"), { status: 400 }));
  }
}

export const intakeBody = [readText, parseText];
