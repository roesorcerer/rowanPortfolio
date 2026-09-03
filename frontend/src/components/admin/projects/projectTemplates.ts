import type { ProjectType } from "../../../types";
import { DETAIL_KEYS } from "../../../lib/projectDetails";

/**
 * What each kind of project usually wants written about it.
 *
 * Templates are a starting point, never a constraint. Nothing here is enforced
 * anywhere — the schema takes any detail and any process step, for any type.
 * This exists so a new product doesn't begin as a blank form that has to be
 * remembered rather than filled in, and so the vocabulary stays consistent
 * across projects of the same kind without being hardcoded into the schema.
 *
 * To give a type a new field, add a row. That is the whole change: no model,
 * no validator, no migration.
 */
export interface DetailTemplate {
  key: string;
  label: string;
  kind?: "text" | "url" | "date";
  /** Shown as the input's placeholder while the value is empty. */
  hint?: string;
}

export interface SectionTemplate {
  heading: string;
  hint?: string;
}

export interface ProjectTemplate {
  details: DetailTemplate[];
  sections: SectionTemplate[];
}

export const PROJECT_TEMPLATES: Record<ProjectType, ProjectTemplate> = {
  product: {
    details: [
      { key: "status", label: "Status", hint: "Shipped, in beta, sunset" },
      { key: "users", label: "Who it's for", hint: "The people it was built for" },
    ],
    sections: [
      {
        heading: "Proposed solutions",
        hint: "The approaches considered, and why this one won",
      },
      {
        heading: "Sketching and wireframes",
        hint: "Early structure — add the sketches as images below",
      },
      {
        heading: "Prototyping and iteration",
        hint: "What changed once it was real enough to use",
      },
    ],
  },
  research: {
    details: [
      { key: DETAIL_KEYS.venue, label: "Venue", hint: "e.g. CHI EA 2026" },
      { key: DETAIL_KEYS.year, label: "Year", hint: "2026" },
    ],
    sections: [
      { heading: "Method", hint: "How the study was actually run" },
      { heading: "Findings", hint: "What the data showed" },
    ],
  },
  practice: {
    details: [
      {
        key: DETAIL_KEYS.purpose,
        label: "Purpose",
        hint: "What this was built to learn",
      },
    ],
    sections: [
      { heading: "What I set out to learn", hint: "The gap this was closing" },
      { heading: "What I built", hint: "The thing itself, briefly" },
    ],
  },
  gameDev: {
    details: [
      { key: "engine", label: "Engine", hint: "e.g. Unity 6, Godot 4" },
      { key: "platform", label: "Platform", hint: "e.g. PC, WebGL" },
      { key: DETAIL_KEYS.purpose, label: "What this build explores", hint: "The design question" },
    ],
    sections: [
      { heading: "Concept and pillars", hint: "What the build is chasing" },
      {
        heading: "Sketching and wireframes",
        hint: "Level sketches, UI blockouts — add images below",
      },
      { heading: "Prototyping and iteration", hint: "What playing it changed" },
      { heading: "Playtesting", hint: "Who played it, and what broke" },
    ],
  },
  art: {
    details: [
      { key: "medium", label: "Medium", hint: "e.g. Oil on linen, procedural" },
      { key: "dimensions", label: "Dimensions", hint: "e.g. 60 × 80 cm" },
      { key: DETAIL_KEYS.year, label: "Year", hint: "2026" },
    ],
    sections: [
      { heading: "Studies and sketches", hint: "What came before the piece" },
      { heading: "Process", hint: "How it was actually made" },
    ],
  },
};
