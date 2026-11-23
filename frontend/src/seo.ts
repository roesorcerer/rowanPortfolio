import type { Project } from "./types";
import { projectPath } from "./lib/projectLinks";
import { SITE_ORIGIN } from "./lib/site";

// What each public page tells search engines and link previews: its title,
// description, canonical URL and Open Graph tags. One source for both
// places those appear. The prerender step writes them into each page's
// <head> (scripts/prerender.mjs), and the pages set document.title from the
// same strings when a visitor navigates in the browser, so a prerendered
// title and a client-side one can never drift apart.

const SITE_NAME = "Rowan Stratton";

export interface PreviewImage {
  /** Absolute: link previews fetch it from wherever the link was pasted. */
  url: string;
  /** Known only for the default image; a project cover's size isn't stored. */
  width?: number;
  height?: number;
  alt: string;
}

/**
 * The preview a shared link shows when its page has no image of its own.
 * Rendered from scripts/og-image.html by `npm run og-image` and committed:
 * it changes only when the design does, and rendering it needs a browser,
 * which the deploy build doesn't have. 1200x630 is the size every major
 * preview (Open Graph, X, LinkedIn, Slack) crops to without letterboxing.
 */
export const DEFAULT_IMAGE: PreviewImage = {
  url: `${SITE_ORIGIN}/og.png`,
  width: 1200,
  height: 630,
  alt: "Rowan Stratton, software engineer and game developer. rowan.page",
};

export interface PageMeta {
  title: string;
  description: string;
  /** Root-relative; made absolute with SITE_ORIGIN where a tag needs it. */
  path: string;
  /** Defaults to DEFAULT_IMAGE, so every page has a large preview. */
  image?: PreviewImage;
  ogType: "website" | "article" | "profile";
  /** ISO timestamp of the last edit, for article:modified_time. */
  modified?: string;
  /** JSON-LD for the page, written as one ld+json block. */
  structuredData?: Record<string, unknown>;
  /** Kept out of search results: the 404 page. */
  noindex?: boolean;
}

// The node every other page's JSON-LD points to as its author, so search
// engines read the projects as one person's work rather than a dozen
// unrelated authors who happen to share a name.
const PERSON_ID = `${SITE_ORIGIN}/#person`;

const PERSON = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": PERSON_ID,
  name: SITE_NAME,
  url: `${SITE_ORIGIN}/`,
  jobTitle: "Software engineer and game developer",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Coleraine",
    addressRegion: "MN",
    addressCountry: "US",
  },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "University of Minnesota Duluth",
  },
  // The same profiles index.html's <noscript> links to.
  sameAs: [
    "https://github.com/roesorcerer",
    "https://www.linkedin.com/in/rowan-stratton-611247247",
  ],
};

export const HOME_META: PageMeta = {
  title: "Rowan Stratton | Software engineer and game developer",
  description:
    "Rowan Stratton is a software engineer, game developer and HCI researcher in Coleraine, MN, building full stack applications and games.",
  path: "/",
  ogType: "website",
  structuredData: PERSON,
};

export const RESUME_META: PageMeta = {
  title: "Resume | Rowan Stratton",
  description:
    "Rowan Stratton's resume: software engineering, game development and HCI research, with an MS in Computer Science from UMN Duluth.",
  path: "/resume",
  ogType: "profile",
};

export const NOT_FOUND_META: PageMeta = {
  title: "Page not found | Rowan Stratton",
  description: "There is no page at this address.",
  path: "/404",
  ogType: "website",
  noindex: true,
};

// Search results show about 155 characters of a description; past that it
// is cut mid-word by the engine anyway, so it is cut at a word here instead.
const DESCRIPTION_MAX = 155;

function clip(text: string): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= DESCRIPTION_MAX) return flat;
  const cut = flat.slice(0, DESCRIPTION_MAX - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 80 ? lastSpace : cut.length)}…`;
}

function absolute(url: string): string | undefined {
  if (/^https?:\/\//.test(url)) return url;
  if (url.startsWith("/")) return `${SITE_ORIGIN}${url}`;
  return undefined;
}

/**
 * A project permalink's metadata. A description written for search
 * (`metaDescription`) wins, since it was written to fit; failing that, the
 * case study's summary describes the page better than the card blurb, since
 * the page is the case study. The cover image is the preview a shared link
 * shows.
 */
export function projectMeta(
  project: Pick<
    Project,
    | "title"
    | "description"
    | "metaDescription"
    | "image"
    | "slug"
    | "_id"
    | "caseStudy"
    | "projectType"
    | "category"
    | "createdAt"
    | "updatedAt"
  >
): PageMeta {
  const description = clip(
    project.metaDescription?.trim() ||
      project.caseStudy?.summary?.trim() ||
      project.description ||
      project.title
  );
  const path = projectPath(project);
  const imageUrl = project.image ? absolute(project.image) : undefined;
  return {
    title: `${project.title} | ${SITE_NAME}`,
    description,
    path,
    image: imageUrl ? { url: imageUrl, alt: project.title } : undefined,
    ogType: "article",
    modified: project.updatedAt,
    structuredData: {
      "@context": "https://schema.org",
      // A paper is a paper to a search engine; everything else Rowan builds
      // (apps, games, art) is a creative work. The narrower game and
      // software types require fields (platform, genre, price) the project
      // record doesn't hold, and a half-filled one is worse than the
      // general type.
      "@type":
        project.projectType === "research"
          ? "ScholarlyArticle"
          : "CreativeWork",
      name: project.title,
      headline: project.title,
      description,
      url: `${SITE_ORIGIN}${path}`,
      ...(imageUrl ? { image: imageUrl } : {}),
      ...(project.category?.length
        ? { keywords: project.category.join(", ") }
        : {}),
      datePublished: project.createdAt,
      dateModified: project.updatedAt,
      author: { "@id": PERSON_ID, "@type": "Person", name: SITE_NAME },
    },
  };
}

const escapeAttr = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

// "</script>" inside the JSON would end the block early; \u003c is the same
// character to a JSON parser and inert to the HTML one. The same reasoning
// as the hydration state block in scripts/prerender.mjs.
const inertJson = (value: unknown) =>
  JSON.stringify(value).replace(/</g, "\\u003c");

/** The <head> tags for a page, as HTML, for the prerender step to insert. */
export function headTags(meta: PageMeta): string {
  const url = `${SITE_ORIGIN}${meta.path}`;
  const image = meta.image ?? DEFAULT_IMAGE;
  const tags = [
    `<title>${escapeAttr(meta.title)}</title>`,
    `<meta name="description" content="${escapeAttr(meta.description)}" />`,
    meta.noindex
      ? `<meta name="robots" content="noindex" />`
      : `<link rel="canonical" href="${escapeAttr(url)}" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:type" content="${meta.ogType}" />`,
    `<meta property="og:title" content="${escapeAttr(meta.title)}" />`,
    `<meta property="og:description" content="${escapeAttr(meta.description)}" />`,
  ];
  if (!meta.noindex) {
    tags.push(`<meta property="og:url" content="${escapeAttr(url)}" />`);
  }
  tags.push(
    `<meta property="og:image" content="${escapeAttr(image.url)}" />`,
    `<meta property="og:image:alt" content="${escapeAttr(image.alt)}" />`
  );
  if (image.width && image.height) {
    tags.push(
      `<meta property="og:image:width" content="${image.width}" />`,
      `<meta property="og:image:height" content="${image.height}" />`
    );
  }
  tags.push(`<meta name="twitter:card" content="summary_large_image" />`);
  if (meta.modified) {
    tags.push(
      `<meta property="article:modified_time" content="${escapeAttr(meta.modified)}" />`
    );
  }
  if (meta.structuredData) {
    // A data block, not a script: the browser never executes it, so the
    // content security policy's script-src doesn't apply (vercel.json).
    tags.push(
      `<script type="application/ld+json">${inertJson(meta.structuredData)}</script>`
    );
  }
  return tags.join("\n    ");
}
