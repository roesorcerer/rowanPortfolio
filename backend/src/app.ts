import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import config from "./config";
import routes from "./routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

// Behind Vercel and Fly, the socket address is Fly's proxy, not the visitor.
// Trusting exactly that many hops makes req.ip the visitor's address, which
// the rate limiters key on. See config.trustProxyHops for why the number
// must be exact.
app.set("trust proxy", config.trustProxyHops);

// --- Security Middleware ---
// helmet() sets ~15 security headers in one call.
// In production, this protects against clickjacking, MIME sniffing,
// XSS, and other common attacks.
app.use(helmet());

// CORS: the one origin allowed to call the API with credentials, which is
// how the admin session cookie rides along. CORS_ORIGIN is https://rowan.page
// in production (the apex: www redirects to it). In development the Vite
// proxy makes requests same-origin, so this only matters if something calls
// the API directly.
//
// This is half the CSRF story; the other half is the cookie's
// SameSite=Strict (utils/session-cookie.ts). Admin writes are JSON, which
// forces a preflight, and the preflight is refused for any other origin.
app.use(
  cors({
    origin: config.isDevelopment ? "http://localhost:3000" : config.corsOrigin,
    credentials: true,
  })
);

// --- Body Parsing ---
// Parses incoming JSON request bodies (POST/PUT/PATCH).
//
// The limit is a backstop against abuse, not a content rule: a request that is
// too big fails here as an opaque 413 naming no field, which is useless to
// whoever was typing. The real bounds are per-field `maxlength`s in the
// validators, which reject with a message saying what to shorten.
//
// 512kb is sized against those caps rather than guessed: a project with every
// field at its maximum — twenty process steps of 8,000 characters each, the
// full twenty-four details, twelve links — comes to 351kb, so this leaves
// ~160kb of headroom and still refuses anything absurd. It was 10kb, which the
// worst legitimate project exceeds by 35x and a single real case study exceeds
// on its own.
app.use(express.json({ limit: "512kb" }));
app.use(express.urlencoded({ extended: true, limit: "512kb" }));

// --- Logging ---
// 'dev' format: concise colored output for development
// 'combined' format: Apache-style logs for production (useful for log aggregation)
app.use(morgan(config.isDevelopment ? "dev" : "combined"));

// --- API Routes ---
// All routes live under /api. This is a convention that makes it
// easy to distinguish API calls from static file serving when you
// deploy behind a reverse proxy (nginx, Cloudflare, etc.).
app.use("/api", routes);

// --- Error Handling ---
// Must be registered AFTER all routes. Express routes errors here
// when next(err) is called or an unhandled exception occurs.
app.use(errorHandler);

export default app;
