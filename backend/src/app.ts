import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import config from "./config";
import routes from "./routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

// --- Security Middleware ---
// helmet() sets ~15 security headers in one call.
// In production, this protects against clickjacking, MIME sniffing,
// XSS, and other common attacks.
app.use(helmet());

// CORS: Allow requests from the React dev server.
// In production, replace this with your actual domain.
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
