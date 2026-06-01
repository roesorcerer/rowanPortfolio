import mongoose, { Schema, Document } from "mongoose";
import { LIMITS } from "../validators/limits";

// This interface represents a Project document in MongoDB.
// It extends Mongoose's Document type, which adds _id, __v,
// save(), remove(), and other Mongoose methods.
export type ProjectType = "featured" | "research" | "practice";

export interface IProject extends Document {
  title: string;
  category: string;
  description: string;
  image: string;
  link?: string;
  githubLink?: string;
  developmentTime?: string;
  technologies: string[];
  featured: boolean;
  projectType: ProjectType;
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
    link: {
      type: String,
      trim: true,
    },
    githubLink: {
      type: String,
      trim: true,
    },
    developmentTime: {
      type: String,
      trim: true,
      maxlength: [LIMITS.project.devTimeMax, `Development time cannot exceed ${LIMITS.project.devTimeMax} characters`],
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
      enum: ["featured", "research", "practice"],
      required: [true, "Project type is required"],
      default: "practice",
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
