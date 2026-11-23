import type { Project, ProjectSummary } from "../src/types";

// What the stubbed API returns to the accessibility checks: enough to fill
// every part of every public page (a product card, a paper, a permalink
// with a full case study and media), so the scan sees the
// pages as a visitor does rather than their empty states.

export const caseStudyProject: Project = {
  _id: "p1",
  slug: "food-forward",
  title: "Food Forward",
  category: ["TypeScript", "React Native"],
  description: "Scheduling for a meal delivery nonprofit.",
  image: "/assets/ff9.png",
  links: [
    { kind: "source", url: "https://github.com/roesorcerer/ff" },
    { kind: "demo", url: "https://example.com/demo" },
  ],
  media: [
    { type: "image", src: "/assets/3dgame.png", alt: "The schedule view" },
  ],
  collaborators: [
    {
      name: "A. Collaborator",
      role: "Designer",
      socialLink: "https://example.com/a",
    },
  ],
  details: [{ key: "year", label: "Year", value: "2025", kind: "text" }],
  order: 0,
  featured: true,
  projectType: "product",
  status: "published",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-02-01T00:00:00.000Z",
  caseStudy: {
    summary: "How a volunteer schedule moved off paper.",
    role: "Lead developer",
    problem: "Shifts were tracked on paper.",
    sections: [
      {
        heading: "Interviews",
        body: "We talked to drivers.",
        media: [{ type: "image", src: "/assets/home.PNG", alt: "Home screen" }],
      },
    ],
    outcomes: ["Fewer missed shifts"],
    lessons: ["Ask the drivers first"],
  },
};

const paper: Project = {
  _id: "p2",
  slug: "when-the-story-stalls",
  title: "When the Story Stalls",
  category: ["HCI", "Games"],
  description: "A study of how players respond when a narrative game pauses.",
  image: "/assets/chi_when_the_story.png",
  links: [{ kind: "research", url: "https://doi.org/10.0000/example" }],
  media: [],
  collaborators: [],
  details: [{ key: "venue", label: "Venue", value: "CHI 2026", kind: "text" }],
  order: 0,
  featured: false,
  projectType: "research",
  researchStatus: "published",
  status: "published",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

function summaryOf({ caseStudy, ...rest }: Project): ProjectSummary {
  return { ...rest, hasCaseStudy: caseStudy !== undefined };
}

export const projectList: ProjectSummary[] = [
  summaryOf(caseStudyProject),
  summaryOf(paper),
];

export const projectsBySlug: Record<string, Project> = {
  [caseStudyProject.slug]: caseStudyProject,
  [paper.slug]: paper,
};
