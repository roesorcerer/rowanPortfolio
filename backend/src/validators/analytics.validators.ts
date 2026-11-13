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

export const trackEventSchema = z.object({
  eventType: z
    .string({ error: "eventType is required" })
    .min(1, "eventType is required")
    .max(
      LIMITS.event.typeMax,
      `eventType cannot exceed ${LIMITS.event.typeMax} characters`
    )
    .trim(),
  projectId: z
    .string()
    .max(
      LIMITS.event.projectIdMax,
      `projectId cannot exceed ${LIMITS.event.projectIdMax} characters`
    )
    .trim()
    .optional(),
  projectTitle: z
    .string()
    .max(
      LIMITS.event.projectTitleMax,
      `projectTitle cannot exceed ${LIMITS.event.projectTitleMax} characters`
    )
    .trim()
    .optional(),
  projectType: z
    .string()
    .max(
      LIMITS.event.projectTypeMax,
      `projectType cannot exceed ${LIMITS.event.projectTypeMax} characters`
    )
    .trim()
    .optional(),
  linkType: z
    .string()
    .max(
      LIMITS.event.linkTypeMax,
      `linkType cannot exceed ${LIMITS.event.linkTypeMax} characters`
    )
    .trim()
    .optional(),
  referrer: z
    .string()
    .max(
      LIMITS.tracking.referrerMax,
      `referrer cannot exceed ${LIMITS.tracking.referrerMax} characters`
    )
    .optional(),
});

export type TrackEventInput = z.infer<typeof trackEventSchema>;
