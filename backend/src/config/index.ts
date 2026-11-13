import dotenv from "dotenv";
import path from "path";

// Load .env BEFORE reading any process.env values.
// path.resolve ensures it finds the file from the project root
// regardless of where Node was launched from.
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// --- Validation ---
// Fail fast: if a required env var is missing, crash immediately
// with a clear message. This is infinitely better than getting
// "MongoParseError: Invalid connection string" 30 seconds later.
const requiredVars = ["MONGODB_URI", "JWT_SECRET"] as const;

for (const varName of requiredVars) {
  if (!process.env[varName]) {
    throw new Error(
      `Missing required environment variable: ${varName}\n` +
        `Copy .env.example to .env and fill in the values.`
    );
  }
}

// A malformed number fails at boot rather than becoming NaN, which
// express-rate-limit would treat as "no limit" and `trust proxy` as false.
function intFromEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === "") return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${name} must be a whole number, got "${raw}"`);
  }
  return value;
}

const config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "5000", 10),
  mongoUri: process.env.MONGODB_URI!,
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  jwtSecret: process.env.JWT_SECRET!,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV !== "production",
  // SMTP / contact form. All optional at load time so the server can still
  // boot without email configured (the /api/contact route will 503 instead).
  smtp: {
    host: process.env.SMTP_HOST || "",
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER || "",
    password: process.env.SMTP_PASSWORD || "",
    from: process.env.SMTP_FROM || process.env.SMTP_USER || "",
  },
  contactEmail: process.env.CONTACT_EMAIL || "",
  // How many X-Forwarded-For entries to skip from the right, for `trust
  // proxy`. Production is 2, and both belong to Fly's proxy: the browser
  // calls the Fly hostname directly (VITE_API_URL), not through Vercel.
  // Checked against live logs, where 2 resolves a browser to its real
  // address even when the request carries a forged X-Forwarded-For.
  //
  // Requests to rowan.page/api/* do pass through Vercel's rewrite, which
  // adds a third entry, so those show up as Vercel addresses. Only crawlers
  // and curl take that path. Raising this to 3 to suit them was tried and
  // reverted: it lets every browser request choose its own rate-limit key.
  //
  // Too low and visitors share a bucket; too high and they pick their key.
  // Locally there is no proxy in front of Express, so the default is 0
  // (trust nothing). Set in fly.toml, so it can be corrected without a code
  // change; afterwards, check `fly logs` shows your own IP for a request the
  // browser made, not one from curl.
  trustProxyHops: intFromEnv("TRUST_PROXY_HOPS", 0),
  // Requests allowed per window by src/middleware/rateLimit.ts, which explains
  // the per-IP/global split and the windows. Env overrides exist so the test
  // suite can raise them out of the way and the rate-limit tests can lower
  // them to something reachable — production uses the defaults.
  rateLimit: {
    loginPerIp: intFromEnv("RATE_LIMIT_LOGIN_PER_IP", 10),
    loginGlobal: intFromEnv("RATE_LIMIT_LOGIN_GLOBAL", 50),
    contactPerIp: intFromEnv("RATE_LIMIT_CONTACT_PER_IP", 5),
    contactGlobal: intFromEnv("RATE_LIMIT_CONTACT_GLOBAL", 50),
  },
} as const;

export default config;
