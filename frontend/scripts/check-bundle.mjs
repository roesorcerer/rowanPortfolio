// Fails the build when a public page's JavaScript outgrows its budget.
// Run after `vite build` (npm run check:bundle; CI runs it). Design doc 8.1:
// public JavaScript at or under 100 KB gzipped per page.
//
// What counts: the scripts build/index.html loads up front, the entry plus
// every chunk it modulepreloads. Every public page (/, /resume, a permalink,
// the 404) is built from that same template, so this is each page's
// JavaScript. The admin and the game are lazy chunks that load only when a
// visitor goes there, so they don't count, and splitting them off is why
// the budget is reachable at all.
//
// Measured gzipped at level 9, matching the "gzip:" column Vite prints, in
// kB of 1000 bytes like Vite, so the number here is the one in the build
// log. Vercel serves brotli, which is smaller still; the budget is about
// the trend, and gzip is the stable number to hold it against.

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const BUDGET_KB = 100;

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const buildDir = path.join(root, "build");

const html = await readFile(path.join(buildDir, "index.html"), "utf8");
const scripts = new Set();
for (const [, src] of html.matchAll(
  /<script\b[^>]*\bsrc="([^"]+\.js)"[^>]*>/g
)) {
  scripts.add(src);
}
for (const [, href] of html.matchAll(
  /<link\b[^>]*\brel="modulepreload"[^>]*\bhref="([^"]+\.js)"[^>]*>/g
)) {
  scripts.add(href);
}
if (scripts.size === 0) {
  throw new Error(
    "check-bundle: build/index.html loads no scripts; run the build first"
  );
}

let total = 0;
const rows = [];
for (const src of scripts) {
  const code = await readFile(path.join(buildDir, src.replace(/^\//, "")));
  const kb = gzipSync(code, { level: 9 }).length / 1000;
  total += kb;
  rows.push(`  ${kb.toFixed(2).padStart(8)} kB  ${src}`);
}

console.log(`check-bundle: public JavaScript, gzipped\n${rows.join("\n")}`);
console.log(
  `  ${total.toFixed(2).padStart(8)} kB  total, budget ${BUDGET_KB} kB`
);

if (total > BUDGET_KB) {
  console.error(
    `check-bundle: ${(total - BUDGET_KB).toFixed(2)} kB over budget. ` +
      "Lazy-load what the public pages don't render on arrival (App.tsx), " +
      "or find what grew with a build's per-module sizes."
  );
  process.exit(1);
}
