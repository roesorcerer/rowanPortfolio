import { z } from "zod";
import { LIMITS } from "./limits";

export const createProjectSchema = z.object({
  title: z
    .string({ error: "Title is required" })
    .min(1, "Title is required")
    .max(LIMITS.project.titleMax, `Title cannot exceed ${LIMITS.project.titleMax} characters`)
    .trim(),
  category: z
    .string({ error: "Category is required" })
    .min(1, "Category is required")
    .trim(),
  description: z
    .string({ error: "Description is required" })
    .min(1, "Description is required")
    .trim(),
  image: z
    .string({ error: "Image path is required" })
    .min(1, "Image path is required"),
  link: z.string().url("Link must be a valid URL").optional(),
  githubLink: z.string().url("GitHub link must be a valid URL").optional(),
  developmentTime: z
    .string()
    .max(
      LIMITS.project.devTimeMax,
      `Development time cannot exceed ${LIMITS.project.devTimeMax} characters`
    )
    .trim()
    .optional(),
  technologies: z.array(z.string().trim()).default([]),
  featured: z.boolean().default(false),
  projectType: z.enum(["featured", "research", "practice"]).default("practice"),
  order: z.number().int().default(0),
});

// For updates, every field is optional — only send what changed.
export const updateProjectSchema = createProjectSchema.partial();

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
