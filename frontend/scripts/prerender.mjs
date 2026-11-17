// Writes one HTML file per public page, after `vite build` and
// `vite build --ssr` (npm run build:site). Design doc section 5.2.
//
//   /                     build/index.html
//   /resume               build/resume/index.html
//   /projects/<slug>      build/projects/<slug>/index.html, one per project
//   anything else         build/404.html, which Vercel serves with a 404
//   /admin/*, /play       build/app.html, the empty shell (vercel.json)
//   plus sitemap.xml and robots.txt
//
// Why at all: the site was a single-page app, so every address returned the
// same empty <div id="root"> with one site-wide title, and crawlers or link
// previews that don't run JavaScript saw nothing (findings F1–F3). Now each
// page's text and metadata are in its HTML, and React hydrates it.
//
// The data comes from the live API. If it can't be reached, or returns no
// projects, the build fails rather than publishing an empty site: the
// previous deploy stays live (Vercel only swaps on a successful build).

import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "build");
const ssrEntry = path.join(root, "dist-ssr", "entry-server.js");

// Spelled the same in src/main.tsx, which reads it back.
const STATE_ID = "prerender-state";

// The production API unless told otherwise. Preview builds may not have
// VITE_API_URL set, and reading published projects from production is what
// a preview of the public site should show anyway: the requests are GETs.
const api = (
  process.env.PRERENDER_API_URL ||
  process.env.VITE_API_URL ||
  "https://api.rowan.page"
)
  .trim()
  .replace(/\/+$/, "");

async function getData(urlPath) {
  const url = `${api}${urlPath}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.success) {
    throw new Error(`prerender: GET ${url} returned ${res.status}`);
  }
  return body.data;
}

const ssr = await import(ssrEntry);
const template = await readFile(path.join(outDir, "index.html"), "utf8");

const SEO_BLOCK = /[ \t]*<!-- seo:start[\s\S]*?<!-- seo:end -->/;
const ROOT_DIV = '<div id="root"></div>';
if (!SEO_BLOCK.test(template) || !template.includes(ROOT_DIV)) {
  throw new Error(
    "prerender: build/index.html is missing the seo markers or the empty " +
      "#root div; see index.html"
  );
}

// The shell keeps the template untouched: the admin and the game render in
// the browser, as the whole site used to.
await writeFile(path.join(outDir, "app.html"), template);

// "</script>" inside the JSON would end the block early; < is the same
// character to JSON.parse and inert to the HTML parser.
const inertJson = (value) => JSON.stringify(value).replace(/</g, "\\u003c");

function page(meta, rendered) {
  return template
    .replace(SEO_BLOCK, `    ${ssr.headTags(meta)}`)
    .replace(
      ROOT_DIV,
      `<div id="root">${rendered.html}</div>\n    ` +
        `<script type="application/json" id="${STATE_ID}">` +
        `${inertJson(rendered.state)}</script>`
    );
}

async function write(file, html) {
  const target = path.join(outDir, file);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, html);
}

const projects = await getData("/api/projects");
if (!Array.isArray(projects) || projects.length === 0) {
  throw new Error("prerender: the API returned no published projects");
}

const written = [];

for (const [url, meta, file] of [
  ["/", ssr.HOME_META, "index.html"],
  ["/resume", ssr.RESUME_META, "resume/index.html"],
  // Any path the router doesn't know renders the not-found page, and the
  // browser hydrates it at whatever address was missed.
  ["/404", ssr.NOT_FOUND_META, "404.html"],
]) {
  await write(file, page(meta, await ssr.render({ url, projects })));
  written.push(url);
}

const sitemap = [
  { loc: "/", lastmod: undefined },
  { loc: "/resume", lastmod: undefined },
];

for (const summary of projects) {
  const url = ssr.projectPath(summary);
  const project = await getData(
    `/api/projects/${encodeURIComponent(summary.slug || summary._id)}`
  );
  await write(
    `${url.slice(1)}/index.html`,
    page(ssr.projectMeta(project), await ssr.render({ url, projects, project }))
  );
  written.push(url);
  sitemap.push({ loc: url, lastmod: project.updatedAt });
}

const escapeXml = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

await write(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    sitemap
      .map(
        ({ loc, lastmod }) =>
          `  <url><loc>${escapeXml(ssr.SITE_ORIGIN + loc)}</loc>` +
          (lastmod ? `<lastmod>${lastmod.slice(0, 10)}</lastmod>` : "") +
          `</url>`
      )
      .join("\n") +
    `\n</urlset>\n`
);

await write(
  "robots.txt",
  `User-agent: *\nDisallow: /admin\n\nSitemap: ${ssr.SITE_ORIGIN}/sitemap.xml\n`
);

// The server bundle was only needed to render; it isn't part of the site.
await rm(path.join(root, "dist-ssr"), { recursive: true, force: true });

console.log(
  `prerender: ${written.length} pages from ${api}\n  ${written.join("\n  ")}`
);
