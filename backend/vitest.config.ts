import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Use Node environment (not jsdom) — this is a backend
    environment: "node",
    // Enable global describe/it/expect so you don't need imports
    globals: true,
    // Run tests in the src directory
    include: ["src/**/*.test.ts"],
    // 10 second timeout — integration tests hit a real DB
    testTimeout: 10000,
    // Run test files sequentially — they share a database connection
    fileParallelism: false,
    // Rate limits high enough that no ordinary test trips them; requests in a
    // file share one in-memory counter. rateLimit.test.ts lowers them for
    // itself before importing the app.
    env: {
      RATE_LIMIT_LOGIN_PER_IP: "1000",
      RATE_LIMIT_LOGIN_GLOBAL: "1000",
      RATE_LIMIT_CONTACT_PER_IP: "1000",
      RATE_LIMIT_CONTACT_GLOBAL: "1000",
    },
  },
});
