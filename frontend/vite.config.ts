/// <reference types="vitest" />
/// <reference types="vite/client" />

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import svgrPlugin from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      // Forward /api requests to the Express backend.
      // This avoids CORS issues in development — the browser thinks
      // it's talking to localhost:3000, but Vite proxies to :5001.
      "/api": "http://localhost:5000",
    },
  },
  plugins: [
    react(),
    svgrPlugin({
      svgrOptions: {
        icon: true,
      },
    }),
  ],
  build: {
    outDir: "./build",
  },
  test: {
    globals: true,
    environment: "jsdom",
    css: true,
    setupFiles: "./src/test/setup.ts",
  },
});
