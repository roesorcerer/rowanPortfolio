import { defineConfig, devices } from "@playwright/test";

// Browser checks against the built site: today, the accessibility scan in
// e2e/a11y.spec.ts. Run `npm run build` first, then `npm run test:a11y`.
//
// It serves build/ with `vite preview`, the plain browser build rather than
// the prerendered one, because prerendering needs the live API and CI
// shouldn't depend on it. The pages render the same either way: hydration
// is tested to match the server's HTML (src/entry-server.test.tsx). The API
// is stubbed per test (e2e/a11y.spec.ts), so no backend runs either.

const PORT = 4173;

export default defineConfig({
  testDir: "e2e",
  // Fail CI on a stray test.only rather than silently skipping the rest.
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    ...devices["Desktop Chrome"],
  },
  webServer: {
    command: `npx vite preview --port ${PORT} --strictPort`,
    port: PORT,
    reuseExistingServer: !process.env.CI,
  },
});
