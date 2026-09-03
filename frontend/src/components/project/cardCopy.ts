import type { ProjectType } from "../../types";

/**
 * What each kind of project calls its own sections.
 *
 * These were five hand-written card layouts. Four of them turned out to be the
 * same card with the labels changed — the tag headings and "Dates", "Date" and
 * "Timeline" all render the same two fields. Research was the only genuinely
 * different shape, because a paper reads as a citation and has no cover image.
 *
 * So the difference between project types is copy, not structure, and it lives
 * here as data. Adding a sixth type means adding a row, not a layout.
 */
export type CardLayout = "media" | "citation";

export interface CardCopy {
  layout: CardLayout;
  /** Type chip above the title. Product goes without — it's the default read. */
  badge?: string;
  badgeClass?: string;
  /** Heading over the lead paragraph. Omitted renders the description bare. */
  leadLabel?: string;
  /**
   * Heading over the tag chips. Named for tags rather than technologies
   * because `technologies` was merged into `category`: one list now carries
   * both the domain tags and the stack, so the label has to describe both.
   */
  tagsLabel: string;
  datesLabel: string;
  /** What following `project.link` actually gets you. */
  demoLabel: string;
}

export const CARD_COPY: Record<ProjectType, CardCopy> = {
  product: {
    layout: "media",
    tagsLabel: "Tags and stack",
    datesLabel: "Dates",
    demoLabel: "Live demo",
  },
  research: {
    layout: "citation",
    tagsLabel: "Topics and methods",
    datesLabel: "Dates",
    demoLabel: "Read manuscript",
  },
  practice: {
    layout: "media",
    badge: "Practice",
    badgeClass: "bg-[#F5F0E1] text-[#8A6A00]",
    leadLabel: "Practice purpose",
    tagsLabel: "Tags and stack",
    datesLabel: "Dates",
    demoLabel: "Live demo",
  },
  gameDev: {
    layout: "media",
    badge: "Game development",
    badgeClass: "bg-[#EAF7F4] text-[#0E6E58]",
    leadLabel: "What this build explores",
    tagsLabel: "Tags and stack",
    datesLabel: "Timeline",
    demoLabel: "Play build",
  },
  art: {
    layout: "media",
    badge: "Art",
    badgeClass: "bg-[#FFF1E9] text-[#A84B12]",
    leadLabel: "About this piece",
    tagsLabel: "Tags and medium",
    datesLabel: "Date",
    demoLabel: "View full piece",
  },
};

/**
 * The lead paragraph. Practice and game builds get a purpose field of their
 * own; everything else leads with the description.
 */
export function leadTextFor(project: {
  projectType: ProjectType;
  practicePurpose?: string;
  description: string;
}): string {
  const usesPurpose =
    project.projectType === "practice" || project.projectType === "gameDev";

  if (usesPurpose) return project.practicePurpose?.trim() || project.description;
  return project.description;
}
