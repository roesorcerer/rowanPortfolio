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
// The limit prevents abuse via oversized payloads.
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

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
