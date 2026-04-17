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

const config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "5000", 10),
  mongoUri: process.env.MONGODB_URI!,
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  jwtSecret: process.env.JWT_SECRET!,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV !== "production",
} as const;

export default config;
