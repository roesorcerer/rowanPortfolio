// Renders scripts/og-image.html to public/og.png, the default link-preview
// image (DEFAULT_IMAGE in src/seo.ts). Run by hand with `npm run og-image`
// after editing the HTML, and commit the PNG: it changes only when the
// design does, and a browser is too heavy to pull into every deploy build.
//
// Uses the Chromium that Playwright installs for the accessibility checks
// (npx playwright install chromium).

import { chromium } from "@playwright/test";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "scripts", "og-image.html");
const target = path.join(root, "public", "og.png");

const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });
  await page.goto(pathToFileURL(source).href);
  // A screenshot taken before the webfonts load would bake the fallback
  // monospace into the image, and nothing would look wrong until it was
  // shared.
  await page.evaluate(() => document.fonts.ready);
  const missing = await page.evaluate(() =>
    ["VT323", "IBM Plex Mono"].filter(
      (family) => !document.fonts.check(`32px "${family}"`)
    )
  );
  if (missing.length > 0) {
    throw new Error(`og-image: fonts did not load: ${missing.join(", ")}`);
  }
  await page.screenshot({ path: target, type: "png" });
  console.log(`og-image: wrote ${path.relative(root, target)}`);
} finally {
  await browser.close();
}
