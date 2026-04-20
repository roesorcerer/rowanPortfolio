import { z } from "zod";

export const contactSchema = z.object({
  name: z
    .string({ error: "Name is required" })
    .min(1, "Name is required")
    .max(100, "Name cannot exceed 100 characters")
    .trim(),
  email: z
    .string({ error: "Email is required" })
    .trim()
    .toLowerCase()
    .email("Invalid email format"),
  subject: z
    .string()
    .max(200, "Subject cannot exceed 200 characters")
    .trim()
    .optional(),
  message: z
    .string({ error: "Message is required" })
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message cannot exceed 5000 characters")
    .trim(),
  // Honeypot: a hidden field that real users leave empty. Bots fill every
  // input they see, so a non-empty value here means the submission is spam.
  // Naming it something plausible (website) makes it more effective than
  // an obvious name like "honeypot".
  website: z.string().max(0, "Spam detected").optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
