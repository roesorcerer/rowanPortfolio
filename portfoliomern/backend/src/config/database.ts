import mongoose from "mongoose";
import config from "./index";

export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(config.mongoUri);
    console.log(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    // Exit with failure code — let the process manager (Docker, PM2,
    // systemd) handle the restart. Do NOT silently swallow this error.
    // A backend without its database is not a functioning backend.
    process.exit(1);
  }
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.connection.close();
  console.log("MongoDB connection closed.");
}

// --- Connection Event Listeners ---
// These fire on connection state changes AFTER the initial connect.
// Useful for monitoring in production — your logging/alerting
// system picks these up.
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected.");
});
