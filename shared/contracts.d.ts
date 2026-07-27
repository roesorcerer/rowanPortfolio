// Shared API contracts between the frontend and backend.
//
// This file declares the wire-format types that cross the HTTP boundary —
// what JSON looks like, after serialization. The backend's internal
// representations (Mongoose Document subtypes with Date timestamps) are
// NOT this; those stay in backend/src/models. Anywhere the backend
// constructs a response body or the frontend consumes one, the shape
// matches what's declared here.
//
// .d.ts means types only — no runtime code, no emit, no build-pipeline
// changes. Both tsconfigs include this file; both tiers import from it
// via relative path.

// ---- Response envelope ----

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ---- Projects ----

export type ProjectType = "featured" | "research" | "practice";

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

export interface Project {
  _id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  media?: ProjectMedia[];
  link?: string;
  githubLink?: string;
  relatedResearchLink?: string;
  developmentTime?: string;
  collaborators?: ProjectCollaborator[];
  technologies: string[];
  featured: boolean;
  projectType: ProjectType;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectPayload {
  title: string;
  category: string;
  description: string;
  image: string;
  media?: ProjectMedia[];
  link?: string;
  githubLink?: string;
  relatedResearchLink?: string;
  developmentTime?: string;
  collaborators?: ProjectCollaborator[];
  technologies: string[];
  projectType: ProjectType;
  featured: boolean;
  order: number;
}

// ---- Contact ----

export interface ContactPayload {
  name: string;
  email: string;
  subject?: string;
  message: string;
  // Honeypot — real users leave this empty; the backend rejects non-empty values.
  website?: string;
}

export interface ContactSubmission {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

// ---- Analytics ----

export interface AnalyticsSummary {
  totalViews: number;
  todayViews: number;
  last7DaysViews: number;
  byPath: { path: string; count: number }[];
  byDay: { date: string; count: number }[];
  byReferrer: { source: string; count: number }[];
  deviceBreakdown: { mobile: number; desktop: number };
  recentVisits: {
    path: string;
    source: string;
    device: "mobile" | "desktop";
    createdAt: string;
  }[];
  byHour: { hour: number; count: number }[];
}

export interface ProjectEngagement {
  projectId: string;
  projectTitle: string;
  projectType: string;
  views: number;
  demoClicks: number;
  githubClicks: number;
}

export interface EngagementSummary {
  projectEngagement: ProjectEngagement[];
  conversionRate: number;
  totalMessages: number;
  totalPageViews: number;
}
