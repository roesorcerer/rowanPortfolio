import mongoose, { Schema, Document } from "mongoose";
import { LIMITS } from "../validators/limits";
import { projectFields } from "../validators/project.validators";
import type {
  ProjectCaseStudy,
  ProjectCaseStudySection,
  ProjectDetail,
  ProjectLink,
  ProjectMedia,
  ProjectRecord,
  ProjectType,
} from "../validators/project.validators";

// The document's *shape* is not declared here — it is inferred from the Zod
// validators, which are the one place a Project field is described. What lives
// in this file is everything Zod cannot express: storage types, indexes,
// Mongoose-level defaults, and the enum/length constraints the database
// enforces on its own.
//
// Re-exported so callers keep importing project vocabulary from the model.
export type {
  ProjectCaseStudy,
  ProjectCaseStudySection,
  ProjectCollaborator,
  ProjectDetail,
  ProjectDetailKind,
  ProjectLink,
  ProjectMedia,
  ProjectMediaType,
  ProjectRecord,
  ProjectStatus,
  ProjectType,
  ResearchStatus,
} from "../validators/project.validators";

/**
 * The taxonomy values, taken from the validator's enum rather than restated.
 * Adding a sixth project type is now a one-line change in one file.
 */
export const PROJECT_TYPES: ProjectType[] = [...projectFields.projectType.options];

/**
 * `order` is scoped to a display group, not global. Featured projects are
 * hoisted into their own group so a promoted project keeps one position in
 * the admin list rather than two.
 */
export function orderGroupKey(project: {
  featured?: boolean;
  projectType: ProjectType;
}): string {
  return project.featured ? "featured" : project.projectType;
}

/**
 * A Project document. Every field comes from `ProjectRecord`; this adds only
 * what Mongoose contributes — the Document methods and the timestamps it
 * manages. A field added to the validators appears here automatically.
 */
export interface IProject extends Document, ProjectRecord {
  createdAt: Date;
  updatedAt: Date;
}

// Declared as real sub-schemas rather than inline object literals: an inline
// `{ type: { ... } }` is ambiguous to Mongoose, which reads a nested `type`
// key as a SchemaType rather than a path named "type".
// One media item. Declared once and reused by the project carousel and by
// case-study steps, so a wireframe gallery inside a step accepts exactly what
// the top-level carousel does.
const mediaItemSchema = new Schema<ProjectMedia>(
  {
    type: { type: String, enum: ["image", "video"], required: true },
    src: {
      type: String,
      required: true,
      trim: true,
      maxlength: [LIMITS.project.imageSrcMax, `Media source cannot exceed ${LIMITS.project.imageSrcMax} characters — reference a file by path, not inline data`],
    },
    alt: { type: String, trim: true },
    poster: { type: String, trim: true },
    caption: { type: String, trim: true },
  },
  { _id: false }
);

// A short named fact: "Venue", "Engine", "Medium". Free-form by design — the
// enum that used to live here was the whole problem.
const detailSchema = new Schema<ProjectDetail>(
  {
    key: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: [LIMITS.project.detailKeyMax, `Detail key cannot exceed ${LIMITS.project.detailKeyMax} characters`],
    },
    label: {
      type: String,
      required: true,
      trim: true,
      maxlength: [LIMITS.project.detailLabelMax, `Detail label cannot exceed ${LIMITS.project.detailLabelMax} characters`],
    },
    value: {
      type: String,
      required: true,
      trim: true,
      maxlength: [LIMITS.project.detailValueMax, `Detail value cannot exceed ${LIMITS.project.detailValueMax} characters`],
    },
    kind: { type: String, enum: ["text", "url", "date"], default: "text" },
  },
  { _id: false }
);

// An outbound link. `kind` is free-form for the same reason `detail.key` is:
// the UI knows "demo", "github" and "research" by name, and anything else
// still renders and still tracks.
const linkSchema = new Schema<ProjectLink>(
  {
    kind: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: [LIMITS.project.linkKindMax, `Link kind cannot exceed ${LIMITS.project.linkKindMax} characters`],
    },
    url: { type: String, required: true, trim: true },
    label: {
      type: String,
      trim: true,
      maxlength: [LIMITS.project.linkLabelMax, `Link label cannot exceed ${LIMITS.project.linkLabelMax} characters`],
    },
  },
  { _id: false }
);

const caseStudySectionSchema = new Schema<ProjectCaseStudySection>(
  {
    heading: {
      type: String,
      required: true,
      trim: true,
      maxlength: [
        LIMITS.project.caseStudyHeadingMax,
        `Section heading cannot exceed ${LIMITS.project.caseStudyHeadingMax} characters`,
      ],
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: [LIMITS.project.caseStudyBodyMax, `Section body cannot exceed ${LIMITS.project.caseStudyBodyMax} characters`],
    },
    media: { type: [mediaItemSchema], default: [] },
  },
  { _id: false }
);

// The long-form process record. Everything inside is optional, so a project
// can carry only a summary and still render as a case study.
const caseStudySchema = new Schema<ProjectCaseStudy>(
  {
    summary: { type: String, trim: true, maxlength: LIMITS.project.caseStudyProseMax },
    role: { type: String, trim: true, maxlength: LIMITS.project.caseStudyProseMax },
    problem: { type: String, trim: true, maxlength: LIMITS.project.caseStudyProseMax },
    sections: { type: [caseStudySectionSchema], default: [] },
    outcomes: { type: [String], default: [] },
    lessons: { type: [String], default: [] },
  },
  { _id: false }
);

const projectSchema = new Schema<IProject>(
  {
    // The resume-facing permalink. Always present — the store derives one from
    // the title on create and never moves it on rename.
    slug: {
      type: String,
      required: [true, "Project slug is required"],
      trim: true,
      lowercase: true,
      maxlength: [LIMITS.project.slugMax, `Slug cannot exceed ${LIMITS.project.slugMax} characters`],
    },
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
      maxlength: [LIMITS.project.titleMax, `Title cannot exceed ${LIMITS.project.titleMax} characters`],
    },
    // Carries both the domain tags and the stack that `technologies` used to
    // hold separately.
    category: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      required: [true, "Project description is required"],
      trim: true,
      maxlength: [LIMITS.project.descriptionMax, `Description cannot exceed ${LIMITS.project.descriptionMax} characters`],
    },
    image: {
      type: String,
      required: [true, "Project image path is required"],
      trim: true,
      maxlength: [LIMITS.project.imageSrcMax, `Image path cannot exceed ${LIMITS.project.imageSrcMax} characters — reference a file by path, not inline data`],
    },
    media: {
      type: [mediaItemSchema],
      default: [],
    },
    links: {
      type: [linkSchema],
      default: [],
    },
    developmentTime: {
      type: String,
      trim: true,
      maxlength: [LIMITS.project.devTimeMax, `Development time cannot exceed ${LIMITS.project.devTimeMax} characters`],
    },
    collaborators: {
      type: [
        {
          name: {
            type: String,
            required: true,
            trim: true,
          },
          role: {
            type: String,
            trim: true,
          },
          socialLink: {
            type: String,
            required: true,
            trim: true,
          },
          socialLabel: {
            type: String,
            trim: true,
          },
        },
      ],
      default: [],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    projectType: {
      type: String,
      enum: PROJECT_TYPES,
      required: [true, "Project type is required"],
      default: "practice",
    },
    researchStatus: {
      type: String,
      enum: ["published", "in-revision"],
      trim: true,
    },
    details: {
      type: [detailSchema],
      default: [],
    },
    caseStudy: {
      type: caseStudySchema,
      default: undefined,
    },
    // New projects start as drafts so a half-finished entry can be saved
    // without appearing on the public site.
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    // timestamps: true automatically adds createdAt and updatedAt
    // fields, and updates updatedAt on every save. You never need
    // to manage these manually.
    timestamps: true,
  }
);

// `order` is only meaningful within a display group, so the useful index is
// the compound one the public tabs and the admin list both sort by.
// Indexes make these queries fast even with thousands of documents.
projectSchema.index({ projectType: 1, featured: -1, order: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ featured: 1, order: 1 });
// Permalink lookups hit this on every case-study page load. Still declared
// sparse: every document now has a slug, so sparse and non-sparse behave
// identically here, and Mongoose will not rebuild an existing index just
// because the spec changed. Left as-is rather than requiring a manual reindex.
projectSchema.index({ slug: 1 }, { unique: true, sparse: true });

export const ProjectModel = mongoose.model<IProject>("Project", projectSchema);
