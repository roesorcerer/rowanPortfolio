import mongoose, { Schema, Document } from "mongoose";
import { LIMITS } from "../validators/limits";

// This interface represents a Project document in MongoDB.
// It extends Mongoose's Document type, which adds _id, __v,
// save(), remove(), and other Mongoose methods.
export type ProjectType = "featured" | "research" | "practice" | "gameDev" | "art";
export type ResearchStatus = "published" | "rejected";
export type ProjectMediaType = "image" | "video";

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
  category: string;
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
      type: String,
      required: [true, "Project category is required"],
      trim: true,
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
      enum: ["featured", "research", "practice", "gameDev", "art"],
      required: [true, "Project type is required"],
      default: "practice",
    },
    researchStatus: {
      type: String,
      enum: ["published", "rejected"],
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

// Index on 'order' for sorted queries, and 'featured' for filtering.
// Indexes make these queries fast even with thousands of documents.
projectSchema.index({ order: 1 });
projectSchema.index({ featured: 1 });
projectSchema.index({ projectType: 1 });

export const ProjectModel = mongoose.model<IProject>("Project", projectSchema);
