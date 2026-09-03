import type { Project, ProjectType, ResearchStatus } from "../../../types";
import { hasCaseStudy } from "../../../lib/projectLinks";
import { DETAIL_KEYS, detailValue, filledDetails } from "../../../lib/projectDetails";

// One place for the vocabulary the admin list speaks, plus the derivations
// that turn a Project into the handful of strings a dense row shows.

export const PROJECT_TYPES: ProjectType[] = [
  "product",
  "research",
  "practice",
  "gameDev",
  "art",
];

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  product: "Product",
  research: "Research",
  practice: "Practice",
  gameDev: "Game development",
  art: "Art",
};

/** Shorter forms for filter chips, where horizontal space is tight. */
export const PROJECT_TYPE_CHIP_LABELS: Record<ProjectType, string> = {
  product: "Product",
  research: "Research",
  practice: "Practice",
  gameDev: "Game",
  art: "Art",
};

export const PROJECT_TYPE_COLORS: Record<ProjectType, string> = {
  product: "bg-accent-soft text-accent-dark",
  research: "bg-[#EEF0FF] text-[#3D4EBF]",
  practice: "bg-[#F5F0E1] text-[#8A6A00]",
  gameDev: "bg-[#EAF7F4] text-[#0E6E58]",
  art: "bg-[#FFF1E9] text-[#A84B12]",
};

export const RESEARCH_STATUS_LABELS: Record<ResearchStatus, string> = {
  published: "Published",
  "in-revision": "In revision",
};

export const RESEARCH_STATUS_COLORS: Record<ResearchStatus, string> = {
  published: "bg-emerald-50 text-emerald-700",
  "in-revision": "bg-rule-soft text-muted",
};

/** The group a project's `order` is counted within. Mirrors the backend. */
export const FEATURED_GROUP = "featured";
export type OrderGroupKey = typeof FEATURED_GROUP | ProjectType;

/**
 * Promoted work is hoisted into its own group, so each project occupies
 * exactly one row in the admin list even though the public site shows a
 * featured project in both the Featured tab and its type tab.
 */
export function orderGroupKey(project: Project): OrderGroupKey {
  return project.featured ? FEATURED_GROUP : project.projectType;
}

export function orderGroupLabel(key: OrderGroupKey): string {
  return key === FEATURED_GROUP ? "Featured" : PROJECT_TYPE_LABELS[key];
}

/**
 * What's conspicuously missing, in the order it matters. Rendered inline on
 * the row so an unfinished entry announces itself without being opened.
 */
export function projectGaps(project: Project): string[] {
  const gaps: string[] = [];

  if (!project.description?.trim()) gaps.push("missing description");
  if (!project.image?.trim()) gaps.push("missing image");
  if (!project.category?.length) gaps.push("missing tags");

  if (project.projectType === "research") {
    if (!project.researchStatus) gaps.push("missing research status");
    if (!detailValue(project, DETAIL_KEYS.venue)) gaps.push("missing venue");
  }

  // Last, because it's the biggest thing to write and the least urgent to
  // fix — a project without one still renders everywhere, it just has no
  // story behind its permalink.
  if (!hasCaseStudy(project.caseStudy)) gaps.push("no case study");

  return gaps;
}

/**
 * The muted second line of a row. Research reads as a citation stub; anything
 * else reads as tags then tech, matching how each is scanned.
 */
export function projectMetaParts(project: Project): string[] {
  if (project.projectType === "research") {
    const originalVenue = detailValue(project, DETAIL_KEYS.originalVenue);
    if (project.researchStatus === "in-revision" && originalVenue) {
      return [`originally ${originalVenue}`];
    }
    const citation = [
      detailValue(project, DETAIL_KEYS.venue),
      detailValue(project, DETAIL_KEYS.year),
    ]
      .filter(Boolean)
      .join(" ");
    return citation ? [citation] : [];
  }

  // One list since the tag and stack arrays merged — the row used to print
  // them as two comma-separated runs, which now would be the same run twice.
  return project.category?.length ? [project.category.join(", ")] : [];
}

/** Every tag in use, de-duplicated case-insensitively and sorted for the filter bar. */
export function collectTags(projects: Project[]): string[] {
  const byKey = new Map<string, string>();

  for (const project of projects) {
    for (const tag of project.category ?? []) {
      const trimmed = tag.trim();
      if (!trimmed) continue;
      const key = trimmed.toLowerCase();
      if (!byKey.has(key)) byKey.set(key, trimmed);
    }
  }

  return [...byKey.values()].sort((a, b) => a.localeCompare(b));
}

/** Free-text haystack for the search box — everything you'd plausibly type. */
export function searchHaystack(project: Project): string {
  return [
    project.title,
    project.description,
    ...(project.category ?? []),
    PROJECT_TYPE_LABELS[project.projectType],
    // Every detail, whatever it is. A fact added today is searchable today,
    // without this function learning its name.
    ...filledDetails(project).flatMap((detail) => [detail.label, detail.value]),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}
