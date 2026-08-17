import mongoose, { Schema, Document } from "mongoose";
import { LIMITS } from "../validators/limits";

// This interface represents a Project document in MongoDB.
// It extends Mongoose's Document type, which adds _id, __v,
// save(), remove(), and other Mongoose methods.
// projectType is a pure taxonomy — one type per project, never a promotion
// flag. `featured` is the only way something gets promoted.
export type ProjectType = "product" | "research" | "practice" | "gameDev" | "art";
export const PROJECT_TYPES: ProjectType[] = [
  "product",
  "research",
  "practice",
  "gameDev",
  "art",
];
export type ResearchStatus = "published" | "in-revision";
export type ProjectStatus = "draft" | "published";
export type ProjectMediaType = "image" | "video";

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

export interface ProjectMedia {
  type: ProjectMediaType;
  src: string;
  alt?: string;
  poster?: string;
  caption?: string;
}

export interface ProjectCollaborator {
  name: string;
  role?: string;
  socialLink: string;
  socialLabel?: string;
}

export interface IProject extends Document {
  title: string;
  category: string[];
  description: string;
  image: string;
  media: ProjectMedia[];
  link?: string;
  githubLink?: string;
  relatedResearchLink?: string;
  developmentTime?: string;
  collaborators: ProjectCollaborator[];
  technologies: string[];
  featured: boolean;
  projectType: ProjectType;
  researchStatus?: ResearchStatus;
  researchVenue?: string;
  researchYear?: number;
  rejectedVenue?: string;
  improvedIntoTitle?: string;
  improvedIntoLink?: string;
  improvementSummary?: string;
  practicePurpose?: string;
  status: ProjectStatus;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
      maxlength: [LIMITS.project.titleMax, `Title cannot exceed ${LIMITS.project.titleMax} characters`],
    },
    category: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      required: [true, "Project description is required"],
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Project image path is required"],
    },
    media: {
      type: [
        {
          type: {
            type: String,
            enum: ["image", "video"],
            required: true,
          },
          src: {
            type: String,
            required: true,
            trim: true,
          },
          alt: {
            type: String,
            trim: true,
          },
          poster: {
            type: String,
            trim: true,
          },
          caption: {
            type: String,
            trim: true,
          },
        },
      ],
      default: [],
    },
    link: {
      type: String,
      trim: true,
    },
    githubLink: {
      type: String,
      trim: true,
    },
    relatedResearchLink: {
      type: String,
      trim: true,
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
    technologies: {
      type: [String],
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
    researchVenue: {
      type: String,
      trim: true,
    },
    researchYear: {
      type: Number,
      min: 1900,
      max: 2100,
    },
    rejectedVenue: {
      type: String,
      trim: true,
    },
    improvedIntoTitle: {
      type: String,
      trim: true,
    },
    improvedIntoLink: {
      type: String,
      trim: true,
    },
    improvementSummary: {
      type: String,
      trim: true,
    },
    practicePurpose: {
      type: String,
      trim: true,
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

export const ProjectModel = mongoose.model<IProject>("Project", projectSchema);
