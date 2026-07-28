import { useCallback, useMemo, useState } from "react";
import type { Project, ProjectType, ResearchStatus } from "../types";
import type { ProjectPayload } from "../api/projects";

// Owns the Project ↔ form ↔ payload marshalling.
//
// FormState exists because <input>s store strings: optionals are "" rather
// than undefined, technologies is a CSV rather than string[]. The hook
// converts a Project into that shape, and converts it back into the
// ProjectPayload the API expects.

export interface FormState {
  title: string;
  category: string;
  description: string;
  image: string;
  link: string;
  githubLink: string;
  relatedResearchLink: string;
  developmentTime: string;
  technologies: string;
  media: {
    type: "image" | "video";
    src: string;
    alt: string;
    poster: string;
    caption: string;
  }[];
  collaborators: {
    name: string;
    role: string;
    socialLink: string;
    socialLabel: string;
  }[];
  projectType: ProjectType;
  featured: boolean;
  researchStatus: ResearchStatus | "";
  researchVenue: string;
  researchYear: string;
  rejectedVenue: string;
  improvedIntoTitle: string;
  improvedIntoLink: string;
  improvementSummary: string;
  practicePurpose: string;
  order: number;
}

export const EMPTY_FORM: FormState = {
  title: "",
  category: "",
  description: "",
  image: "",
  link: "",
  githubLink: "",
  relatedResearchLink: "",
  developmentTime: "",
  technologies: "",
  media: [],
  collaborators: [],
  projectType: "practice",
  featured: false,
  researchStatus: "",
  researchVenue: "",
  researchYear: "",
  rejectedVenue: "",
  improvedIntoTitle: "",
  improvedIntoLink: "",
  improvementSummary: "",
  practicePurpose: "",
  order: 0,
};

export function fromProject(project: Project): FormState {
  return {
    title: project.title,
    category: project.category,
    description: project.description,
    image: project.image,
    link: project.link ?? "",
    githubLink: project.githubLink ?? "",
    relatedResearchLink: project.relatedResearchLink ?? "",
    developmentTime: project.developmentTime ?? "",
    technologies: project.technologies.join(", "),
    media: (project.media ?? []).map((item) => ({
      type: item.type,
      src: item.src,
      alt: item.alt ?? "",
      poster: item.poster ?? "",
      caption: item.caption ?? "",
    })),
    collaborators: (project.collaborators ?? []).map((c) => ({
      name: c.name,
      role: c.role ?? "",
      socialLink: c.socialLink,
      socialLabel: c.socialLabel ?? "",
    })),
    projectType: project.projectType,
    featured: project.featured,
    researchStatus: project.researchStatus ?? "",
    researchVenue: project.researchVenue ?? "",
    researchYear: project.researchYear ? String(project.researchYear) : "",
    rejectedVenue: project.rejectedVenue ?? "",
    improvedIntoTitle: project.improvedIntoTitle ?? "",
    improvedIntoLink: project.improvedIntoLink ?? "",
    improvementSummary: project.improvementSummary ?? "",
    practicePurpose: project.practicePurpose ?? "",
    order: project.order,
  };
}

export function toPayload(form: FormState): ProjectPayload {
  return {
    title: form.title,
    category: form.category,
    description: form.description,
    image: form.image,
    link: form.link || undefined,
    githubLink: form.githubLink || undefined,
    relatedResearchLink: form.relatedResearchLink || undefined,
    developmentTime: form.developmentTime || undefined,
    technologies: form.technologies
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    media: form.media
      .map((item) => ({
        type: item.type,
        src: item.src.trim(),
        alt: item.alt.trim() || undefined,
        poster: item.poster.trim() || undefined,
        caption: item.caption.trim() || undefined,
      }))
      .filter((item) => item.src.length > 0),
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
    researchVenue: form.researchVenue.trim() || undefined,
    researchYear: form.researchYear.trim() ? Number(form.researchYear) : undefined,
    rejectedVenue: form.rejectedVenue.trim() || undefined,
    improvedIntoTitle: form.improvedIntoTitle.trim() || undefined,
    improvedIntoLink: form.improvedIntoLink.trim() || undefined,
    improvementSummary: form.improvementSummary.trim() || undefined,
    practicePurpose: form.practicePurpose.trim() || undefined,
    order: form.order,
  };
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
