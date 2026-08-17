import { z } from "zod";
import { LIMITS } from "./limits";

const mediaItemSchema = z.object({
  type: z.enum(["image", "video"]),
  src: z.string().min(1, "Media source is required").trim(),
  alt: z.string().trim().optional(),
  poster: z.string().trim().optional(),
  caption: z.string().trim().optional(),
});

const collaboratorSchema = z.object({
  name: z.string().min(1, "Collaborator name is required").trim(),
  role: z.string().trim().optional(),
  socialLink: z.string().url("Collaborator social link must be a valid URL"),
  socialLabel: z.string().trim().optional(),
});

// Tags. Accepts a bare string too, so requests written against the old
// single-string category still validate.
const categorySchema = z
  .union([z.string(), z.array(z.string())])
  .transform((value) =>
    (typeof value === "string" ? [value] : value)
      .map((tag) => tag.trim())
      .filter(Boolean)
  );

// The field schemas, without defaults.
//
// Defaults are applied only in createProjectSchema below. They must not leak
// into the update schema: `.partial()` does not strip a `.default()`, so a
// PUT of `{ title: "x" }` against a defaulted field would parse to the
// default and overwrite whatever was there — silently clearing technologies,
// un-featuring the project, or flipping it back to a draft.
const projectFields = {
  title: z
    .string({ error: "Title is required" })
    .min(1, "Title is required")
    .max(LIMITS.project.titleMax, `Title cannot exceed ${LIMITS.project.titleMax} characters`)
    .trim(),
  category: categorySchema,
  description: z
    .string({ error: "Description is required" })
    .min(1, "Description is required")
    .trim(),
  image: z
    .string({ error: "Image path is required" })
    .min(1, "Image path is required"),
  link: z.string().url("Link must be a valid URL").optional(),
  githubLink: z.string().url("GitHub link must be a valid URL").optional(),
  relatedResearchLink: z
    .string()
    .url("Related research link must be a valid URL")
    .optional(),
  developmentTime: z
    .string()
    .max(
      LIMITS.project.devTimeMax,
      `Development time cannot exceed ${LIMITS.project.devTimeMax} characters`
    )
    .trim()
    .optional(),
  technologies: z.array(z.string().trim()),
  media: z.array(mediaItemSchema),
  collaborators: z.array(collaboratorSchema),
  featured: z.boolean(),
  projectType: z.enum(["product", "research", "practice", "gameDev", "art"]),
  researchStatus: z.enum(["published", "in-revision"]).optional(),
  researchVenue: z.string().trim().optional(),
  researchYear: z.number().int().min(1900).max(2100).optional(),
  rejectedVenue: z.string().trim().optional(),
  improvedIntoTitle: z.string().trim().optional(),
  improvedIntoLink: z.string().url("Improved manuscript link must be a valid URL").optional(),
  improvementSummary: z.string().trim().optional(),
  practicePurpose: z.string().trim().optional(),
  status: z.enum(["draft", "published"]),
  // Omit it and the store appends to the end of the display group. The admin
  // form always omits it; reordering goes through reorderProjectsSchema.
  order: z.number().int().optional(),
};

export const createProjectSchema = z.object({
  ...projectFields,
  category: projectFields.category.default([]),
  technologies: projectFields.technologies.default([]),
  media: projectFields.media.default([]),
  collaborators: projectFields.collaborators.default([]),
  featured: projectFields.featured.default(false),
  projectType: projectFields.projectType.default("practice"),
  // New projects start hidden so a half-finished entry is savable.
  status: projectFields.status.default("draft"),
});

// For updates, every field is optional — only send what changed, and only
// what was sent gets written.
export const updateProjectSchema = z.object(projectFields).partial();

// PUT /api/projects/reorder — array index becomes the new order, so the whole
// group's indices are rewritten in a single call.
export const reorderProjectsSchema = z.object({
  ids: z
    .array(z.string().min(1, "Project id is required"))
    .min(1, "At least one project id is required"),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ReorderProjectsInput = z.infer<typeof reorderProjectsSchema>;
