import app from "./app";
import config from "./config";
import { connectDatabase, disconnectDatabase } from "./config/database";
import { createAdmin } from "./scripts/createAdmin";

// Connect to MongoDB FIRST, then start accepting HTTP requests.
// This ensures no request hits a controller before the database
// is ready. If the DB connection fails, the server never starts.
async function start() {
  await connectDatabase();
  await createAdmin();

  const server = app.listen(config.port, () => {
    console.log(
      `Server running in ${config.env} mode on http://localhost:${config.port}`
    );
  });

  // Graceful shutdown: close HTTP connections, then close DB.
  // Order matters — stop accepting new requests first, then
  // disconnect the database after in-flight requests complete.
  function shutdown(signal: string) {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      await disconnectDatabase();
      console.log("Server closed.");
      process.exit(0);
    });
  }

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

start();
