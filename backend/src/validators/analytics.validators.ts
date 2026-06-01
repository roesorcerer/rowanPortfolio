import { z } from "zod";
import { LIMITS } from "./limits";

export const trackEventSchema = z.object({
  eventType: z
    .string({ error: "eventType is required" })
    .min(1, "eventType is required")
    .max(LIMITS.event.typeMax, `eventType cannot exceed ${LIMITS.event.typeMax} characters`)
    .trim(),
  projectId: z
    .string()
    .max(LIMITS.event.projectIdMax, `projectId cannot exceed ${LIMITS.event.projectIdMax} characters`)
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
    .max(LIMITS.event.linkTypeMax, `linkType cannot exceed ${LIMITS.event.linkTypeMax} characters`)
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
