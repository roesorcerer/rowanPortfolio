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

/** How a detail's value should be rendered. Text unless stated otherwise. */
export type ProjectDetailKind = "text" | "url" | "date";

/**
 * One short, named fact about a project — "Venue: CHI EA 2026", "Engine:
 * Unity 6", "Medium: oil on linen".
 *
 * This replaces the per-type columns the schema used to carry (researchVenue,
 * researchYear, practicePurpose, and the revision trail). Those cost an
 * eight-file edit each and only ever served one project type; a detail costs
 * nothing and serves any of them. Long-form content does NOT belong here —
 * that is what `caseStudy.sections` is for.
 */
export interface ProjectDetail {
  /**
   * Stable machine key, e.g. "venue". Rendering code looks facts up by key, so
   * renaming the visible `label` never breaks a citation line. Keys are
   * lowercase and unique within a project.
   */
  key: string;
  /** What the reader sees, e.g. "Venue". Free to rename at any time. */
  label: string;
  value: string;
  kind?: ProjectDetailKind;
}

/**
 * One beat of the process narrative. Sections are ordered and free-form
 * rather than a fixed Problem/Design/Build schema, because the process a
 * research paper went through and the process a game build went through
 * don't share a spine — only the fact that there were steps.
 */
export interface ProjectCaseStudySection {
  heading: string;
  body: string;
  /**
   * Supporting stills for this step, in order. An array rather than a single
   * `mediaSrc` because the steps that most want images — sketching, wireframes,
   * iteration — are exactly the ones with a sequence to show, and one image per
   * step forced those into separate steps that weren't separate phases.
   */
  media: ProjectMedia[];
}

/**
 * The long-form "how this was actually made" record. Distinct from
 * `description`, which is the one-paragraph card blurb: a case study is what
 * someone reads after following a link off a resume.
 */
export interface ProjectCaseStudy {
  /** Lede paragraph — the whole story in a breath. */
  summary?: string;
  /** What *you* did, as opposed to what the team did. */
  role?: string;
  /** The problem the work set out to solve, and for whom. */
  problem?: string;
  sections: ProjectCaseStudySection[];
  /** What shipped / what changed, one claim per entry. */
  outcomes: string[];
  /** What you'd carry into the next build. */
  lessons: string[];
}

/**
 * One outbound link. `kind` is free-form, like `ProjectDetail.key`: the three
 * the UI knows by name are "demo", "github" and "research", which carry default
 * labels and analytics verbs. Anything else ("itch", "steam", "figma") renders
 * with its own `label` and tracks under its own kind — no code change.
 */
export interface ProjectLink {
  kind: string;
  url: string;
  /** Overrides the default label for this kind. */
  label?: string;
}

export interface ProjectCollaborator {
  name: string;
  role?: string;
  socialLink: string;
  socialLabel?: string;
}

export interface Project {
  _id: string;
  /**
   * Stable, human-readable permalink segment: `/projects/<slug>`. Generated
   * from the title on create and then frozen — renaming a project does NOT
   * move its slug, because the old one may already be printed on a resume.
   * Change it only by editing the field deliberately.
   */
  slug: string;
  title: string;
  /**
   * Free-form tags, rendered as chips. Carries both the domain tags and the
   * stack that `technologies` used to hold separately — the two were the same
   * field twice: both free strings, both chips, both searchable, differing only
   * in a warning rule.
   */
  category: string[];
  description: string;
  image: string;
  /**
   * Always present on a response — the schema defaults it to `[]` — so this is
   * required here even though `ProjectPayload` lets a client omit it.
   */
  media: ProjectMedia[];
  /** Outbound links, in the order they should render. */
  links: ProjectLink[];
  developmentTime?: string;
  collaborators: ProjectCollaborator[];
  featured: boolean;
  projectType: ProjectType;
  /**
   * Kept as a typed field rather than folded into `details` because it drives
   * layout, not just display: the public Research tab splits on it and the
   * card heading badges it. Everything that merely *renders* now lives in
   * `details`.
   */
  researchStatus?: ResearchStatus;
  /** Short named facts, admin-authored and ordered. See ProjectDetail. */
  details: ProjectDetail[];
  caseStudy?: ProjectCaseStudy;
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
  /**
   * Omit it and the backend derives one from the title, de-duplicating with
   * a numeric suffix. Send it to pin a permalink you've already published.
   */
  slug?: string;
  title: string;
  category: string[];
  description: string;
  image: string;
  media?: ProjectMedia[];
  links?: ProjectLink[];
  developmentTime?: string;
  collaborators?: ProjectCollaborator[];
  projectType: ProjectType;
  featured: boolean;
  researchStatus?: ResearchStatus;
  /** Omit it and the project keeps no short facts. */
  details?: ProjectDetail[];
  caseStudy?: ProjectCaseStudy;
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
