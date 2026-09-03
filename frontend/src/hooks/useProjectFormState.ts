import { useCallback, useMemo, useState } from "react";
import type {
  Project,
  ProjectCaseStudy,
  ProjectDetail,
  ProjectDetailKind,
  ProjectLink,
  ProjectStatus,
  ProjectType,
  ResearchStatus,
} from "../types";
import type { ProjectPayload } from "../api/projects";

// Owns the Project ↔ form ↔ payload marshalling.
//
// FormState exists because <input>s store strings: optionals are "" rather
// than undefined, technologies is a CSV rather than string[]. The hook
// converts a Project into that shape, and converts it back into the
// ProjectPayload the API expects.
//
// `order` is deliberately absent: it's scoped to a display group and written
// by drag-to-reorder, never typed in.

/** One media item as the form holds it: optionals are "" rather than undefined. */
export interface MediaFormState {
  type: "image" | "video";
  src: string;
  alt: string;
  poster: string;
  caption: string;
}

export const EMPTY_MEDIA: MediaFormState = {
  type: "image",
  src: "",
  alt: "",
  poster: "",
  caption: "",
};

/**
 * A short named fact. `key` is what rendering code searches for and `label` is
 * what a reader sees, so the form lets you edit the label freely while the key
 * stays put — renaming "Venue" to "Published in" must not break the citation
 * line that looks up `venue`.
 */
/**
 * One outbound link as the form holds it. `kind` is a free string, so the
 * select offers the three the UI knows and still accepts anything typed.
 */
export interface LinkFormState {
  kind: string;
  url: string;
  label: string;
}

export const EMPTY_LINK: LinkFormState = { kind: "demo", url: "", label: "" };

export interface DetailFormState {
  key: string;
  label: string;
  value: string;
  kind: ProjectDetailKind;
}

/**
 * The case study as the form holds it. Outcomes and lessons are one textarea
 * each, one item per line: they're written as a list in one sitting, and a
 * repeater of single-line inputs would be all chrome and no writing.
 */
export interface CaseStudyFormState {
  summary: string;
  role: string;
  problem: string;
  sections: {
    heading: string;
    body: string;
    media: MediaFormState[];
  }[];
  outcomes: string;
  lessons: string;
}

export interface FormState {
  /**
   * The permalink segment. Blank on a new project means "derive it from the
   * title"; on an existing one it's shown filled in, because changing it
   * breaks any resume already carrying the old link.
   */
  slug: string;
  title: string;
  /**
   * Tags, edited as chips. Carries the stack too since `technologies` merged
   * in — one chip box rather than a chip box and a CSV field that behaved
   * identically.
   */
  category: string[];
  description: string;
  image: string;
  links: LinkFormState[];
  developmentTime: string;
  media: MediaFormState[];
  collaborators: {
    name: string;
    role: string;
    socialLink: string;
    socialLabel: string;
  }[];
  projectType: ProjectType;
  featured: boolean;
  researchStatus: ResearchStatus | "";
  /** Short named facts. Any project type, any number of them. */
  details: DetailFormState[];
  caseStudy: CaseStudyFormState;
  status: ProjectStatus;
}

export const EMPTY_CASE_STUDY: CaseStudyFormState = {
  summary: "",
  role: "",
  problem: "",
  sections: [],
  outcomes: "",
  lessons: "",
};

export const EMPTY_FORM: FormState = {
  slug: "",
  title: "",
  category: [],
  description: "",
  image: "",
  links: [],
  developmentTime: "",
  media: [],
  collaborators: [],
  projectType: "practice",
  featured: false,
  researchStatus: "",
  details: [],
  caseStudy: EMPTY_CASE_STUDY,
  // New projects start as drafts — a half-finished entry is savable without
  // going live.
  status: "draft",
};

export function fromProject(project: Project): FormState {
  return {
    slug: project.slug ?? "",
    title: project.title,
    category: project.category ?? [],
    description: project.description,
    image: project.image,
    links: (project.links ?? []).map((link) => ({
      kind: link.kind,
      url: link.url,
      label: link.label ?? "",
    })),
    developmentTime: project.developmentTime ?? "",
    media: (project.media ?? []).map(mediaFromProject),
    collaborators: (project.collaborators ?? []).map((c) => ({
      name: c.name,
      role: c.role ?? "",
      socialLink: c.socialLink,
      socialLabel: c.socialLabel ?? "",
    })),
    projectType: project.projectType,
    featured: project.featured,
    researchStatus: project.researchStatus ?? "",
    details: (project.details ?? []).map((detail) => ({
      key: detail.key,
      label: detail.label,
      value: detail.value,
      kind: detail.kind ?? "text",
    })),
    caseStudy: caseStudyFromProject(project.caseStudy),
    status: project.status ?? "published",
  };
}

export function toPayload(form: FormState): ProjectPayload {
  return {
    // Blank means "let the backend derive one" — sending "" would fail
    // validation, and sending the title would freeze a slug the admin never
    // chose to pin.
    slug: form.slug.trim() || undefined,
    title: form.title,
    category: normalizeTags(form.category),
    description: form.description,
    image: form.image,
    links: toLinksPayload(form.links),
    developmentTime: form.developmentTime || undefined,
    media: toMediaPayload(form.media),
    collaborators: form.collaborators
      .map((c) => ({
        name: c.name.trim(),
        role: c.role.trim() || undefined,
        socialLink: c.socialLink.trim(),
        socialLabel: c.socialLabel.trim() || undefined,
      }))
      .filter((c) => c.name.length > 0 && c.socialLink.length > 0),
    projectType: form.projectType,
    featured: form.featured,
    researchStatus: form.researchStatus || undefined,
    details: toDetailsPayload(form.details),
    caseStudy: toCaseStudyPayload(form.caseStudy),
    status: form.status,
    // No `order` — the backend appends new projects to the end of their
    // display group, and moving one is a drag, not a number.
  };
}

function mediaFromProject(item: {
  type: "image" | "video";
  src: string;
  alt?: string;
  poster?: string;
  caption?: string;
}): MediaFormState {
  return {
    type: item.type,
    src: item.src,
    alt: item.alt ?? "",
    poster: item.poster ?? "",
    caption: item.caption ?? "",
  };
}

/** Drops sourceless rows — an added-then-abandoned slot isn't media. */
function toMediaPayload(media: MediaFormState[]) {
  return media
    .map((item) => ({
      type: item.type,
      src: item.src.trim(),
      alt: item.alt.trim() || undefined,
      poster: item.poster.trim() || undefined,
      caption: item.caption.trim() || undefined,
    }))
    .filter((item) => item.src.length > 0);
}

/**
 * A detail needs a label and a value to mean anything; a template-seeded row
 * nobody filled in is dropped rather than saved as an empty fact. The key
 * falls back to a slug of the label so a hand-added detail doesn't need one
 * typed by hand.
 */
/**
 * A link needs a kind and a URL. A row added and then abandoned is dropped
 * rather than failing the whole save on URL validation.
 */
function toLinksPayload(links: LinkFormState[]): ProjectLink[] {
  return links
    .map((link) => ({
      kind: link.kind.trim().toLowerCase(),
      url: link.url.trim(),
      label: link.label.trim() || undefined,
    }))
    .filter((link) => link.kind.length > 0 && link.url.length > 0);
}

function toDetailsPayload(details: DetailFormState[]): ProjectDetail[] {
  return details
    .map((detail) => {
      const label = detail.label.trim();
      return {
        key: (detail.key.trim() || label).toLowerCase().replace(/[^a-z0-9]+/g, ""),
        label,
        value: detail.value.trim(),
        kind: detail.kind,
      };
    })
    .filter((detail) => detail.key.length > 0 && detail.label.length > 0 && detail.value.length > 0);
}

function caseStudyFromProject(
  caseStudy: ProjectCaseStudy | undefined
): CaseStudyFormState {
  if (!caseStudy) return EMPTY_CASE_STUDY;

  return {
    summary: caseStudy.summary ?? "",
    role: caseStudy.role ?? "",
    problem: caseStudy.problem ?? "",
    sections: (caseStudy.sections ?? []).map((section) => ({
      heading: section.heading,
      body: section.body,
      media: (section.media ?? []).map(mediaFromProject),
    })),
    outcomes: (caseStudy.outcomes ?? []).join("\n"),
    lessons: (caseStudy.lessons ?? []).join("\n"),
  };
}

/**
 * Always returns an object, even an entirely empty one.
 *
 * Returning `undefined` would read as "no change" rather than "cleared":
 * JSON.stringify drops undefined keys, so a case study emptied in the form
 * would never reach the backend and the old text would survive the save. The
 * backend unsets an empty case study instead.
 *
 * A section missing either a heading or a body is dropped: the backend
 * requires both, and a half-typed section shouldn't fail the whole save.
 */
function toCaseStudyPayload(form: CaseStudyFormState): ProjectCaseStudy {
  const caseStudy: ProjectCaseStudy = {
    summary: form.summary.trim() || undefined,
    role: form.role.trim() || undefined,
    problem: form.problem.trim() || undefined,
    sections: form.sections
      .map((section) => ({
        heading: section.heading.trim(),
        body: section.body.trim(),
        media: toMediaPayload(section.media),
      }))
      .filter((section) => section.heading.length > 0 && section.body.length > 0),
    outcomes: splitLines(form.outcomes),
    lessons: splitLines(form.lessons),
  };

  return caseStudy;
}

/** One item per line, blanks dropped. */
function splitLines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/**
 * Trims, drops blanks, and de-duplicates case-insensitively while keeping the
 * casing you first typed. Stops "Web App" and "web app" becoming two tags.
 */
export function normalizeTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const tag of tags) {
    const trimmed = tag.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(trimmed);
  }

  return result;
}

export interface UseProjectFormState {
  form: FormState;
  setField: <K extends keyof FormState>(field: K, value: FormState[K]) => void;
  payload: ProjectPayload;
}

export function useProjectFormState(
  initial: Project | null
): UseProjectFormState {
  const [form, setForm] = useState<FormState>(() =>
    initial ? fromProject(initial) : EMPTY_FORM
  );

  const setField = useCallback(
    <K extends keyof FormState>(field: K, value: FormState[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const payload = useMemo(() => toPayload(form), [form]);

  return { form, setField, payload };
}
