import { z } from "zod";
import { LIMITS } from "./limits";

// Intake clips, never rejects, on length (docs/adr/0001): the caller is a
// browser, and a page view with a 600-character referrer is still a real page
// view. Type and shape are a different matter. A non-string path used to
// reach `.slice()` and raise a 500, and a value that isn't a path at all is
// not a page view anyone loaded, so both are a 400.
const clippedTo = (max: number) =>
  z.string().transform((value) => value.slice(0, max));

export const trackPageViewSchema = z.object({
  path: z
    .string({ error: "path is required" })
    .startsWith("/", "path must start with /")
    .transform((value) => value.slice(0, LIMITS.tracking.pathMax)),
  referrer: clippedTo(LIMITS.tracking.referrerMax).optional(),
});

export type TrackPageViewInput = z.infer<typeof trackPageViewSchema>;

// The event types intake accepts, and the only ones. Listed here because Zod needs
// values at runtime and shared/contracts.d.ts (AnalyticsEventType) is
// types only; analytics.contract-parity.ts fails tsc if the two disagree.
// An unknown type used to be stored and then silently ignored by the
// engagement report, so a typo or a scripted post looked like data.
export const EVENT_TYPES = ["project_view", "link_click"] as const;

// Trimmed, then clipped: the same intake rule as page views (above).
const trimmedClippedTo = (max: number) =>
  z
    .string()
    .trim()
    .transform((value) => value.slice(0, max));

export const trackEventSchema = z.object({
  // Trimmed before the check, as it always was, so "  link_click " still
  // counts; only the set of names is new.
  eventType: z
    .string({ error: "eventType is required" })
    .trim()
    .pipe(
      z.enum(EVENT_TYPES, {
        error: `eventType must be one of: ${EVENT_TYPES.join(", ")}`,
      })
    ),
  projectId: trimmedClippedTo(LIMITS.event.projectIdMax).optional(),
  projectTitle: trimmedClippedTo(LIMITS.event.projectTitleMax).optional(),
  projectType: trimmedClippedTo(LIMITS.event.projectTypeMax).optional(),
  linkType: trimmedClippedTo(LIMITS.event.linkTypeMax).optional(),
  referrer: clippedTo(LIMITS.tracking.referrerMax).optional(),
});

export type TrackEventInput = z.infer<typeof trackEventSchema>;
