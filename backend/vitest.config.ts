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
  },
});
