import { LIMITS } from "../validators/limits";

/**
 * Turns a title into a permalink segment: "Food Forward" -> "food-forward".
 *
 * Diacritics are folded rather than dropped so "Café" becomes "cafe" instead
 * of "caf", and everything outside [a-z0-9] collapses to a single hyphen.
 * Returns "" for input with nothing usable in it; callers decide what to do
 * with that rather than getting a surprise "-" back.
 */
export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    // Strip the combining marks NFKD just split off.
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, LIMITS.project.slugMax)
    // A trailing hyphen can reappear if the slice landed mid-separator.
    .replace(/-+$/g, "");
}

/** Whether a value is already in the canonical form `slugify` produces. */
export function isSlug(value: string): boolean {
  return value.length > 0 && slugify(value) === value;
}
