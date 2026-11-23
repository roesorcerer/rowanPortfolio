// Writes compressed, resized copies of every image in public/assets, and a
// manifest the <Picture> component reads to offer them. Runs first in
// `npm run build`, before Vite, so both the browser and server bundles see
// the same manifest. Design doc section 5.3, finding F13.
//
//   public/assets/thearchive/fiasco.png   (stays: stored paths keep working)
//   public/img/thearchive/fiasco-480.avif  -960.avif  -1600.avif
//   public/img/thearchive/fiasco-480.webp  -960.webp  -1600.webp
//   src/generated/images.json             { "/assets/thearchive/fiasco.png":
//                                            { width, height, widths } }
//
// Both outputs are gitignored. The originals stay the source of truth and
// keep being what a project record stores (`/assets/...`), so nothing in
// MongoDB changes and an image added through the admin works before the
// next build optimizes it, just unoptimized.
//
// Why these choices:
// - AVIF first, WebP second, the original last: AVIF is about half the size
//   of WebP for screenshots like these, WebP covers the browsers without
//   AVIF, and the original <img src> covers everything else.
// - 480, 960, 1600 wide: a phone, a laptop column, a 2x laptop column. A
//   width at or above the original is skipped, since upscaling only adds
//   bytes; an image narrower than 480 gets one copy at its own width.
// - Unchanged files are skipped by mtime, so a local rebuild is quick. A
//   fresh checkout (CI, Vercel) encodes everything, several images at a
//   time: one AVIF encode barely uses a second core, so one at a time took
//   two and a half minutes; eight at once took forty seconds.

import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { availableParallelism } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = path.join(root, "public", "assets");
const outDir = path.join(root, "public", "img");
const manifestFile = path.join(root, "src", "generated", "images.json");

const WIDTHS = [480, 960, 1600];
const FORMATS = {
  // Effort trades build time for bytes. 4 for AVIF is the point past which
  // each step roughly doubles encode time for a percent or two.
  avif: (image) => image.avif({ quality: 55, effort: 4 }),
  webp: (image) => image.webp({ quality: 75 }),
};
const RASTER = /\.(png|jpe?g)$/i;

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (RASTER.test(entry.name)) yield full;
  }
}

async function newer(target, than) {
  try {
    return (await stat(target)).mtimeMs >= than;
  } catch {
    return false;
  }
}

const started = Date.now();
const manifest = {};
let encoded = 0;

async function optimize(file) {
  const rel = path.relative(sourceDir, file).split(path.sep).join("/");
  const { mtimeMs } = await stat(file);
  const input = await readFile(file);
  // Rotated by EXIF first, so a phone photo's width and height are the ones
  // it displays at, not the sensor's.
  const meta = await sharp(input).rotate().metadata();
  const upright = meta.orientation >= 5;
  const width = upright ? meta.height : meta.width;
  const height = upright ? meta.width : meta.height;
  if (!width || !height) {
    throw new Error(`optimize-images: can't read the size of ${rel}`);
  }

  const widths = WIDTHS.filter((w) => w < width);
  if (widths.length === 0) widths.push(width);

  const base = rel.replace(RASTER, "");
  for (const w of widths) {
    for (const [format, encode] of Object.entries(FORMATS)) {
      const target = path.join(outDir, `${base}-${w}.${format}`);
      if (await newer(target, mtimeMs)) continue;
      await mkdir(path.dirname(target), { recursive: true });
      await encode(sharp(input).rotate().resize({ width: w })).toFile(target);
      encoded += 1;
    }
  }

  manifest[`/assets/${rel}`] = { width, height, widths };
}

const files = [];
for await (const file of walk(sourceDir)) files.push(file);
// Sorted so the manifest's key order, and so its diff, is stable.
files.sort();

// A fixed pool of workers pulling from one queue: Promise.all over every
// file would hold all ninety decoded images in memory at once.
const queue = [...files];
await Promise.all(
  Array.from({ length: Math.min(availableParallelism(), 8) }, async () => {
    for (let file = queue.shift(); file; file = queue.shift()) {
      await optimize(file);
    }
  })
);

const ordered = Object.fromEntries(
  Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b))
);

await mkdir(path.dirname(manifestFile), { recursive: true });
await writeFile(manifestFile, `${JSON.stringify(ordered, null, 2)}\n`);

console.log(
  `optimize-images: ${Object.keys(manifest).length} images, ` +
    `${encoded} files encoded in ${((Date.now() - started) / 1000).toFixed(1)}s`
);
