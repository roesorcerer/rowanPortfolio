import { z } from "zod";
import { LIMITS } from "./limits";

export const contactSchema = z.object({
  name: z
    .string({ error: "Name is required" })
    .min(1, "Name is required")
    .max(LIMITS.contact.nameMax, `Name cannot exceed ${LIMITS.contact.nameMax} characters`)
    .trim(),
  email: z
    .string({ error: "Email is required" })
    .trim()
    .toLowerCase()
    .email("Invalid email format"),
  subject: z
    .string()
    .max(LIMITS.contact.subjectMax, `Subject cannot exceed ${LIMITS.contact.subjectMax} characters`)
    .trim()
    .optional(),
  message: z
    .string({ error: "Message is required" })
    .min(LIMITS.contact.messageMin, `Message must be at least ${LIMITS.contact.messageMin} characters`)
    .max(LIMITS.contact.messageMax, `Message cannot exceed ${LIMITS.contact.messageMax} characters`)
    .trim(),
  // Honeypot: a hidden field real users leave empty. Bots fill every input
  // they see, so a non-empty value here means the submission is spam.
  website: z.string().max(0, "Spam detected").optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
