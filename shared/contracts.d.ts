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

// projectType is a pure taxonomy: exactly one per project, and it never
// encodes promotion. Promotion is the `featured` boolean, and nothing else.
// Anything that used to be projectType: "featured" is now
// projectType: "product" + featured: true.
export type ProjectType = "product" | "research" | "practice" | "gameDev" | "art";
export type ResearchStatus = "published" | "in-revision";

// Publication state of the admin record itself, independent of research
// publication state. Drafts are invisible to the public API.
export type ProjectStatus = "draft" | "published";

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
  /** Free-form tags, rendered as chips. Autocompleted from existing values. */
  category: string[];
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
  researchStatus?: ResearchStatus;
  researchVenue?: string;
  researchYear?: number;
  rejectedVenue?: string;
  improvedIntoTitle?: string;
  improvedIntoLink?: string;
  improvementSummary?: string;
  practicePurpose?: string;
  status: ProjectStatus;
  /**
   * Position within the project's display group, where the group is
   * `featured ? "featured" : projectType`. Contiguous from 0 within a group;
   * meaningless across groups. Written by the reorder endpoint, never typed
   * in by hand.
   */
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectPayload {
  title: string;
  category: string[];
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
  researchStatus?: ResearchStatus;
  researchVenue?: string;
  researchYear?: number;
  rejectedVenue?: string;
  improvedIntoTitle?: string;
  improvedIntoLink?: string;
  improvementSummary?: string;
  practicePurpose?: string;
  status: ProjectStatus;
  /**
   * Omit it and the backend appends the project to the end of its display
   * group. The admin form never sends it — reordering goes through
   * `PUT /api/projects/reorder` instead.
   */
  order?: number;
}

/** Body of `PUT /api/projects/reorder` — array index becomes the new order. */
export interface ProjectReorderPayload {
  ids: string[];
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
