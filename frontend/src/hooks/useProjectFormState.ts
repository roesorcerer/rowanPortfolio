import { useCallback, useMemo, useState } from "react";
import type { Project, ProjectType } from "../types";
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
  developmentTime: string;
  technologies: string;
  projectType: ProjectType;
  featured: boolean;
  order: number;
}

export const EMPTY_FORM: FormState = {
  title: "",
  category: "",
  description: "",
  image: "",
  link: "",
  githubLink: "",
  developmentTime: "",
  technologies: "",
  projectType: "practice",
  featured: false,
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
    developmentTime: project.developmentTime ?? "",
    technologies: project.technologies.join(", "),
    projectType: project.projectType,
    featured: project.featured,
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
    developmentTime: form.developmentTime || undefined,
    technologies: form.technologies
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    projectType: form.projectType,
    featured: form.featured,
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
