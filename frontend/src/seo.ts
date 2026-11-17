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

export interface PageMeta {
  title: string;
  description: string;
  /** Root-relative; made absolute with SITE_ORIGIN where a tag needs it. */
  path: string;
  /** Absolute URL of the preview image, when the page has one. */
  image?: string;
  ogType: "website" | "article" | "profile";
  /** Kept out of search results: the 404 page. */
  noindex?: boolean;
}

export const HOME_META: PageMeta = {
  title: "Rowan Stratton | Software engineer and game developer",
  description:
    "Rowan Stratton is a software engineer, game developer and HCI researcher in Coleraine, MN, building full stack applications and games.",
  path: "/",
  ogType: "website",
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
 * A project permalink's metadata. The case study's summary describes the
 * page better than the card blurb when there is one, since the page is the
 * case study; the cover image is the preview a shared link shows.
 */
export function projectMeta(
  project: Pick<
    Project,
    "title" | "description" | "image" | "slug" | "_id" | "caseStudy"
  >
): PageMeta {
  const summary = project.caseStudy?.summary?.trim();
  return {
    title: `${project.title} | ${SITE_NAME}`,
    description: clip(summary || project.description || project.title),
    path: projectPath(project),
    image: project.image ? absolute(project.image) : undefined,
    ogType: "article",
  };
}

const escapeAttr = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

/** The <head> tags for a page, as HTML, for the prerender step to insert. */
export function headTags(meta: PageMeta): string {
  const url = `${SITE_ORIGIN}${meta.path}`;
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
  if (meta.image) {
    tags.push(
      `<meta property="og:image" content="${escapeAttr(meta.image)}" />`,
      `<meta name="twitter:card" content="summary_large_image" />`
    );
  } else {
    tags.push(`<meta name="twitter:card" content="summary" />`);
  }
  return tags.join("\n    ");
}
