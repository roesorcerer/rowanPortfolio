// Shared types for the frontend.
// These mirror the backend's API response shape.

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export type ProjectType = "featured" | "research" | "practice";

export interface Project {
  _id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  link?: string;
  technologies: string[];
  featured: boolean;
  projectType: ProjectType;
  order: number;
  createdAt: string;
  updatedAt: string;
}
