import { z } from "zod";
import { LIMITS } from "./limits";
import { slugify } from "../utils/slug";

// A path or a URL, never inline data. A pasted `data:` URI would be stored in
// Mongo and re-sent to every visitor on every project list, so the cap rejects
// it here with a message that says what to do instead.
const imageSrc = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(
      LIMITS.project.imageSrcMax,
      `${label} cannot exceed ${LIMITS.project.imageSrcMax} characters — put the file in frontend/public/assets and reference it as /assets/your-file.png`
    );

const mediaItemSchema = z.object({
  type: z.enum(["image", "video"]),
  src: imageSrc("Media source"),
  alt: z.string().trim().optional(),
  poster: z.string().trim().optional(),
  caption: z.string().trim().optional(),
});

// Free-form by design. `key` is normalized so a fact typed as "Venue" and one
// typed as "venue" are the same fact, which is what lets rendering code look
// facts up by key without caring how the admin capitalized the label.
const detailSchema = z.object({
  key: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Detail key is required")
    .max(
      LIMITS.project.detailKeyMax,
      `Detail key cannot exceed ${LIMITS.project.detailKeyMax} characters`
    ),
  label: z
    .string()
    .trim()
    .min(1, "Detail label is required")
    .max(
      LIMITS.project.detailLabelMax,
      `Detail label cannot exceed ${LIMITS.project.detailLabelMax} characters`
    ),
  value: z
    .string()
    .trim()
    .min(1, "Detail value is required")
    .max(
      LIMITS.project.detailValueMax,
      `Detail value cannot exceed ${LIMITS.project.detailValueMax} characters`
    ),
  kind: z.enum(["text", "url", "date"]).optional(),
});

const caseStudySectionSchema = z.object({
  heading: z
    .string()
    .min(1, "Section heading is required")
    .max(
      LIMITS.project.caseStudyHeadingMax,
      `Section heading cannot exceed ${LIMITS.project.caseStudyHeadingMax} characters`
    )
    .trim(),
  body: z
    .string()
    .min(1, "Section body is required")
    .max(
      LIMITS.project.caseStudyBodyMax,
      `Section body cannot exceed ${LIMITS.project.caseStudyBodyMax} characters`
    )
    .trim(),
  media: z.array(mediaItemSchema).max(LIMITS.project.sectionMediaMax).default([]),
});

// Every part is optional so a case study can be written incrementally — a
// summary today, the process sections next week — without failing validation
// in between.
const caseStudySchema = z.object({
  summary: z
    .string()
    .trim()
    .max(
      LIMITS.project.caseStudyProseMax,
      `Summary cannot exceed ${LIMITS.project.caseStudyProseMax} characters`
    )
    .optional(),
  role: z
    .string()
    .trim()
    .max(
      LIMITS.project.caseStudyProseMax,
      `Role cannot exceed ${LIMITS.project.caseStudyProseMax} characters`
    )
    .optional(),
  problem: z
    .string()
    .trim()
    .max(
      LIMITS.project.caseStudyProseMax,
      `Problem cannot exceed ${LIMITS.project.caseStudyProseMax} characters`
    )
    .optional(),
  sections: z
    .array(caseStudySectionSchema)
    .max(LIMITS.project.caseStudySectionsMax)
    .default([]),
  outcomes: z
    .array(z.string().trim().max(LIMITS.project.caseStudyListItemMax))
    .max(LIMITS.project.caseStudyListMax)
    .default([]),
  lessons: z
    .array(z.string().trim().max(LIMITS.project.caseStudyListItemMax))
    .max(LIMITS.project.caseStudyListMax)
    .default([]),
});

// Free-form `kind`, same reasoning as `detail.key`. The URL is validated
// because a broken outbound link is worse than a missing one.
const linkSchema = z.object({
  kind: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Link kind is required")
    .max(
      LIMITS.project.linkKindMax,
      `Link kind cannot exceed ${LIMITS.project.linkKindMax} characters`
    ),
  url: z.string().url("Link must be a valid URL"),
  label: z
    .string()
    .trim()
    .max(
      LIMITS.project.linkLabelMax,
      `Link label cannot exceed ${LIMITS.project.linkLabelMax} characters`
    )
    .optional(),
});

const collaboratorSchema = z.object({
  name: z.string().min(1, "Collaborator name is required").trim(),
  role: z.string().trim().optional(),
  socialLink: z.string().url("Collaborator social link must be a valid URL"),
  socialLabel: z.string().trim().optional(),
});

// Tags — domain and stack in one list, de-duplicated case-insensitively so
// "React" and "react" don't both become chips. Accepts a bare string too, so
// requests written against the old single-string category still validate.
const categorySchema = z
  .union([z.string(), z.array(z.string())])
  .transform((value) => {
    const tags = (typeof value === "string" ? [value] : value)
      .map((tag) => tag.trim())
      .filter(Boolean);
    // Keeps the casing first typed, drops later case-variants.
    const seen = new Map<string, string>();
    for (const tag of tags) {
      const key = tag.toLowerCase();
      if (!seen.has(key)) seen.set(key, tag);
    }
    return [...seen.values()];
  });

// The field schemas, without defaults.
//
// Defaults are applied only in createProjectSchema below. They must not leak
// into the update schema: `.partial()` does not strip a `.default()`, so a
// PUT of `{ title: "x" }` against a defaulted field would parse to the
// default and overwrite whatever was there — silently clearing the tags,
// un-featuring the project, or flipping it back to a draft.
export const projectFields = {
  // Normalized rather than rejected: the admin types a title-ish string into
  // the slug box, and what gets stored is always canonical. Emptiness is
  // filtered out here so the store falls back to deriving one from the title.
  slug: z
    .string()
    .transform((value) => slugify(value))
    .refine((value) => value.length > 0, "Slug must contain at least one letter or digit"),
  title: z
    .string({ error: "Title is required" })
    .min(1, "Title is required")
    .max(LIMITS.project.titleMax, `Title cannot exceed ${LIMITS.project.titleMax} characters`)
    .trim(),
  category: categorySchema,
  description: z
    .string({ error: "Description is required" })
    .min(1, "Description is required")
    .max(
      LIMITS.project.descriptionMax,
      `Description cannot exceed ${LIMITS.project.descriptionMax} characters`
    )
    .trim(),
  image: imageSrc("Image path"),
  links: z
    .array(linkSchema)
    .max(
      LIMITS.project.linksMax,
      `A project cannot have more than ${LIMITS.project.linksMax} links`
    ),
  developmentTime: z
    .string()
    .max(
      LIMITS.project.devTimeMax,
      `Development time cannot exceed ${LIMITS.project.devTimeMax} characters`
    )
    .trim()
    .optional(),
  media: z.array(mediaItemSchema).max(LIMITS.project.mediaMax),
  collaborators: z.array(collaboratorSchema),
  featured: z.boolean(),
  projectType: z.enum(["product", "research", "practice", "gameDev", "art"]),
  researchStatus: z.enum(["published", "in-revision"]).optional(),
  // Duplicate keys are collapsed last-wins rather than rejected: the admin
  // renaming one fact into another's key is a merge, not a validation error.
  details: z
    .array(detailSchema)
    .max(
      LIMITS.project.detailsMax,
      `A project cannot have more than ${LIMITS.project.detailsMax} details`
    )
    .transform((items) => [...new Map(items.map((d) => [d.key, d])).values()]),
  caseStudy: caseStudySchema,
  status: z.enum(["draft", "published"]),
  // Omit it and the store appends to the end of the display group. The admin
  // form always omits it; reordering goes through reorderProjectsSchema.
  order: z.number().int().optional(),
};

/**
 * The canonical object schema: every field, no defaults applied, nothing made
 * partial. This is the source of truth for the Project *shape* — the Mongoose
 * document interface and the store's types are inferred from it below rather
 * than restated, so a field added here reaches storage and the API without
 * being retyped in three dialects.
 *
 * The create/update schemas still branch off `projectFields` directly, because
 * their difference is the point: `createProjectSchema` applies defaults and
 * `updateProjectSchema` must not (see the comment above `projectFields`).
 */
export const projectShape = z.object(projectFields);

/**
 * The validated *output* of every field — post-transform, so `category` is
 * already a de-duplicated array and `details` already collapsed on key.
 */
export type ProjectFields = z.infer<typeof projectShape>;

/**
 * What a stored project always holds.
 *
 * Two fields differ between what a request may send and what a document has,
 * and both differences are real rather than oversights:
 *   order      — omitted on create; the store appends to the display group,
 *                so the document always has one even though the input may not.
 *   caseStudy  — absent until someone writes one; the store unsets an emptied
 *                one rather than storing a husk of blanks.
 */
export type ProjectRecord = Omit<ProjectFields, "order" | "caseStudy"> & {
  order: number;
  caseStudy?: ProjectFields["caseStudy"];
};

// The nested shapes, named for the places that need them (Mongoose sub-schemas,
// the store's mappers). Derived rather than declared so they cannot drift from
// the validators that produce them.
export type ProjectMedia = ProjectFields["media"][number];
export type ProjectDetail = ProjectFields["details"][number];
export type ProjectLink = ProjectFields["links"][number];
export type ProjectCollaborator = ProjectFields["collaborators"][number];
export type ProjectCaseStudy = NonNullable<ProjectFields["caseStudy"]>;
export type ProjectCaseStudySection = ProjectCaseStudy["sections"][number];
export type ProjectType = ProjectFields["projectType"];
export type ProjectStatus = ProjectFields["status"];
export type ResearchStatus = NonNullable<ProjectFields["researchStatus"]>;
export type ProjectMediaType = ProjectMedia["type"];
export type ProjectDetailKind = NonNullable<ProjectDetail["kind"]>;

export const createProjectSchema = z.object({
  ...projectFields,
  // Omitted on create — the store derives it from the title.
  slug: projectFields.slug.optional(),
  caseStudy: projectFields.caseStudy.optional(),
  category: projectFields.category.default([]),
  links: projectFields.links.default([]),
  media: projectFields.media.default([]),
  details: projectFields.details.default([]),
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
