import type { Project, ProjectDetail } from "../types";

// Reading side of `project.details` — the free-form list of short named facts
// that replaced the per-type columns (researchVenue, practicePurpose, and the
// revision trail).
//
// The whole point of `details` is that adding a fact costs nothing: an admin
// can give a game build an "Engine" or a painting a "Medium" without a code
// change, and it renders. The keys below are the exceptions — the handful of
// facts that other code needs to *find*, because they feed a citation line or
// a status inference rather than just a label/value row.

/**
 * Keys the UI looks up by name. Stored keys are lowercased by both the Zod
 * validator and the Mongoose schema, so these are lowercase too.
 *
 * A key here is a promise: rename the label all you like, but the key is what
 * `ProjectCard`'s citation line and `researchStatusOf` search for.
 */
export const DETAIL_KEYS = {
  venue: "venue",
  year: "year",
  originalVenue: "originalvenue",
  improvedInto: "improvedinto",
  improvedIntoLink: "improvedintolink",
  improvementSummary: "improvementsummary",
  purpose: "purpose",
} as const;

export type WellKnownDetailKey = (typeof DETAIL_KEYS)[keyof typeof DETAIL_KEYS];

type HasDetails = Pick<Project, "details">;

/** Case-insensitive so a hand-typed key still matches a well-known one. */
export function detailFor(
  project: HasDetails,
  key: string
): ProjectDetail | undefined {
  const wanted = key.trim().toLowerCase();
  return (project.details ?? []).find(
    (detail) => detail.key.trim().toLowerCase() === wanted
  );
}

/** The value, or undefined when the fact is absent or blank. */
export function detailValue(
  project: HasDetails,
  key: string
): string | undefined {
  return detailFor(project, key)?.value.trim() || undefined;
}

/** Every detail with something actually written in it, in authored order. */
export function filledDetails(project: HasDetails): ProjectDetail[] {
  return (project.details ?? []).filter((detail) => detail.value.trim());
}

/**
 * Details minus the ones a surface has already rendered in a bespoke way, so
 * a research card can show its citation line *and* a generic list of whatever
 * else was added, without printing the venue twice.
 */
export function detailsExcept(
  project: HasDetails,
  keys: readonly string[]
): ProjectDetail[] {
  const skip = new Set(keys.map((key) => key.trim().toLowerCase()));
  return filledDetails(project).filter(
    (detail) => !skip.has(detail.key.trim().toLowerCase())
  );
}

/** The keys that together make up a research revision trail. */
export const REVISION_TRAIL_KEYS = [
  DETAIL_KEYS.originalVenue,
  DETAIL_KEYS.improvedInto,
  DETAIL_KEYS.improvedIntoLink,
  DETAIL_KEYS.improvementSummary,
] as const;

/** Whether any part of a revision trail has been written. */
export function hasRevisionTrail(project: HasDetails): boolean {
  return REVISION_TRAIL_KEYS.some((key) => detailValue(project, key));
}
