import type { Project, ProjectMedia, ResearchStatus } from "../../types";
import { hasRevisionTrail } from "../../lib/projectDetails";

// The derivations every project surface needs, in one place.
//
// Each of these existed independently in ProjectCard, Main, ProjectModal and
// ProjectPage. Four copies of "what counts as in-revision" is four chances for
// the card and the modal to disagree about the same project.

/**
 * A research project's status, inferred when it isn't set explicitly: a
 * revision trail is only ever filled in for work that's still in revision.
 * Null for anything that isn't research.
 */
export function researchStatusOf(project: Project): ResearchStatus | null {
  if (project.projectType !== "research") return null;
  if (project.researchStatus) return project.researchStatus;

  return hasRevisionTrail(project) ? "in-revision" : "published";
}

/**
 * When the work happened. A hand-written `developmentTime` always wins —
 * record timestamps say when the *entry* was edited, which is a different
 * fact and a misleading one on an old project touched last week.
 */
export function datesLabel(project: Project): string {
  if (project.developmentTime?.trim()) return project.developmentTime;

  const created = formatMonth(project.createdAt);
  const updated = formatMonth(project.updatedAt);

  if (created && updated && created !== updated) return `${created} - ${updated}`;

  return updated ?? created ?? "Not specified";
}

function formatMonth(value: string): string | null {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;

  return parsed.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

/**
 * The carousel's items, falling back to the cover image so every project has
 * at least one thing to show.
 */
export function mediaItemsOf(project: Project): ProjectMedia[] {
  if (project.media && project.media.length > 0) return project.media;

  return [{ type: "image", src: project.image, alt: project.title }];
}

/** Whether a project points anywhere outside the site. */
export function hasExternalLinks(project: Project): boolean {
  return (project.links ?? []).some((link) => link.url?.trim());
}
