import { ProjectModel } from "../models/project.model";
import type {
  CreateProjectInput,
  UpdateProjectInput,
} from "../validators/project.validators";

export type Project = {
  _id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  media?: {
    type: "image" | "video";
    src: string;
    alt?: string;
    poster?: string;
    caption?: string;
  }[];
  link?: string;
  githubLink?: string;
  relatedResearchLink?: string;
  developmentTime?: string;
  collaborators?: {
    name: string;
    role?: string;
    socialLink: string;
    socialLabel?: string;
  }[];
  technologies: string[];
  featured: boolean;
  projectType: "featured" | "research" | "practice";
  order: number;
  createdAt: Date;
  updatedAt: Date;
};

type ProjectDoc = {
  _id: unknown;
  title: string;
  category: string;
  description: string;
  image: string;
  media?: {
    type: "image" | "video";
    src: string;
    alt?: string;
    poster?: string;
    caption?: string;
  }[];
  link?: string;
  githubLink?: string;
  relatedResearchLink?: string;
  developmentTime?: string;
  collaborators?: {
    name: string;
    role?: string;
    socialLink: string;
    socialLabel?: string;
  }[];
  technologies?: string[];
  featured?: boolean;
  projectType: Project["projectType"];
  order?: number;
  createdAt: Date;
  updatedAt: Date;
};

function toProject(doc: ProjectDoc): Project {
  return {
    _id: String(doc._id),
    title: doc.title,
    category: doc.category,
    description: doc.description,
    image: doc.image,
    media: doc.media ?? [],
    link: doc.link,
    githubLink: doc.githubLink,
    relatedResearchLink: doc.relatedResearchLink,
    developmentTime: doc.developmentTime,
    collaborators: doc.collaborators ?? [],
    technologies: doc.technologies ?? [],
    featured: doc.featured ?? false,
    projectType: doc.projectType,
    order: doc.order ?? 0,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function isCastError(error: unknown): boolean {
  return (error as { name?: string })?.name === "CastError";
}

export async function list(): Promise<Project[]> {
  const docs = await ProjectModel.find().sort({ order: 1 }).lean();
  return docs.map((d) => toProject(d as ProjectDoc));
}

export async function findById(id: string): Promise<Project | null> {
  try {
    const doc = await ProjectModel.findById(id).lean();
    return doc ? toProject(doc as ProjectDoc) : null;
  } catch (error) {
    if (isCastError(error)) return null;
    throw error;
  }
}

export async function create(input: CreateProjectInput): Promise<Project> {
  const doc = await ProjectModel.create(input);
  return toProject(doc.toObject() as ProjectDoc);
}

export async function update(
  id: string,
  patch: UpdateProjectInput
): Promise<Project | null> {
  try {
    const doc = await ProjectModel.findByIdAndUpdate(id, patch, {
      returnDocument: "after",
      runValidators: true,
    }).lean();
    return doc ? toProject(doc as ProjectDoc) : null;
  } catch (error) {
    if (isCastError(error)) return null;
    throw error;
  }
}

export async function remove(id: string): Promise<boolean> {
  try {
    const doc = await ProjectModel.findByIdAndDelete(id);
    return doc !== null;
  } catch (error) {
    if (isCastError(error)) return false;
    throw error;
  }
}
