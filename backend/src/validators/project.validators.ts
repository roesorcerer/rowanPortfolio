import { z } from "zod";

export const createProjectSchema = z.object({
  title: z
    .string({ error: "Title is required" })
    .min(1, "Title is required")
    .max(200, "Title cannot exceed 200 characters")
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
    .max(60, "Development time cannot exceed 60 characters")
    .trim()
    .optional(),
  technologies: z.array(z.string().trim()).default([]),
  featured: z.boolean().default(false),
  projectType: z.enum(["featured", "research", "practice"]).default("practice"),
  order: z.number().int().default(0),
});

// For updates, every field is optional — you only send what changed.
// .partial() makes all fields optional while preserving their validation
// rules when a field IS provided.
export const updateProjectSchema = createProjectSchema.partial();

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
