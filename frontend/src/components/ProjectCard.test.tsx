import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProjectCard from "./ProjectCard";
import type { Project } from "../types";

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    _id: "abc123",
    slug: "test-project",
    title: "Test Project",
    category: ["Web App"],
    description: "A test project",
    image: "/assets/test.png",
    links: [],
    media: [],
    collaborators: [],
    details: [],
    order: 1,
    featured: true,
    projectType: "product",
    status: "published",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function renderCard(project: Project) {
  return render(
    <MemoryRouter>
      <ProjectCard project={project} />
    </MemoryRouter>
  );
}

describe("ProjectCard", () => {
  it("renders project title and category", () => {
    renderCard(makeProject());

    expect(screen.getByText("Test Project")).toBeInTheDocument();
    expect(screen.getByText("Web App")).toBeInTheDocument();
  });

  it("renders the project image", () => {
    renderCard(makeProject());

    const img = screen.getByAltText("Test Project");
    expect(img).toHaveAttribute("src", "/assets/test.png");
  });

  // There is no modal any more — the card is the overview, and clicking
  // through goes straight to the write-up.
  it("links the title and the explore action to the project page", () => {
    renderCard(makeProject());

    expect(screen.getByRole("link", { name: "Test Project" })).toHaveAttribute(
      "href",
      "/projects/test-project"
    );
    expect(screen.getByRole("link", { name: /Explore project/ })).toHaveAttribute(
      "href",
      "/projects/test-project"
    );
  });

  it("renders the demo link when the project carries one", () => {
    renderCard(makeProject({ links: [{ kind: "demo", url: "https://example.com" }] }));

    expect(screen.getByLabelText("Open Test Project live demo")).toHaveAttribute(
      "href",
      "https://example.com"
    );
  });
});

describe("ProjectCard layouts", () => {
  it("labels a game build's sections in its own words", () => {
    renderCard(
      makeProject({
        projectType: "gameDev",
        details: [{ key: "purpose", label: "Purpose", value: "Pacing through difficulty" }],
        links: [{ kind: "demo", url: "https://play.example.com" }],
      })
    );

    expect(screen.getByText("Game development")).toBeInTheDocument();
    expect(screen.getByText("What this build explores")).toBeInTheDocument();
    expect(screen.getByText("Timeline")).toBeInTheDocument();
    expect(screen.getByLabelText("Open Test Project play build")).toBeInTheDocument();
  });

  it("labels an art piece's sections in its own words", () => {
    renderCard(makeProject({ projectType: "art" }));

    expect(screen.getByText("Art")).toBeInTheDocument();
    expect(screen.getByText("Date")).toBeInTheDocument();
  });

  // Same fields, same layout — only the wording moves.
  it("leaves a product card unbadged and plainly labelled", () => {
    renderCard(makeProject({ projectType: "product" }));

    expect(screen.getByText("Dates")).toBeInTheDocument();
    expect(screen.queryByText("Practice")).not.toBeInTheDocument();
  });

  it("renders research as a citation with no cover image", () => {
    renderCard(
      makeProject({
        projectType: "research",
        details: [
          { key: "venue", label: "Venue", value: "CHI EA 2026" },
          { key: "year", label: "Year", value: "2026" },
        ],
        collaborators: [{ name: "Ada Lovelace", socialLink: "https://example.com" }],
      })
    );

    expect(screen.queryByAltText("Test Project")).not.toBeInTheDocument();
    expect(screen.getByText("CHI EA 2026")).toBeInTheDocument();
    expect(screen.getByText("Published")).toBeInTheDocument();
    expect(screen.getByText(/Ada Lovelace/)).toBeInTheDocument();
  });

  it("marks research with a revision trail as a developing manuscript", () => {
    renderCard(
      makeProject({
        projectType: "research",
        details: [
          { key: "originalvenue", label: "Originally submitted to", value: "CSCW 2025" },
        ],
      })
    );

    expect(screen.getByText("Developing manuscript")).toBeInTheDocument();
  });
});

// The tag and stack arrays merged into `category`, so the card renders one
// chip row rather than chips plus a separate "Technologies" line.
describe("merged tags", () => {
  it("renders every tag as a chip, stack included", () => {
    renderCard(makeProject({ category: ["Mobile app", "React Native", "Django"] }));

    for (const tag of ["Mobile app", "React Native", "Django"]) {
      expect(screen.getByText(tag)).toBeInTheDocument();
    }
  });
});

describe("links", () => {
  it("keeps an unknown kind out of the card's own two-link row", () => {
    // The card deliberately shows only the demo and the source; everything
    // else surfaces in ProjectLinks on the modal and the page.
    renderCard(
      makeProject({
        projectType: "gameDev",
        links: [
          { kind: "itch", url: "https://x.itch.io/y", label: "Play on itch.io" },
        ],
      })
    );

    expect(screen.queryByText("Play on itch.io")).toBeNull();
  });

  it("shows the source link from a github-kind entry", () => {
    renderCard(
      makeProject({ links: [{ kind: "github", url: "https://github.com/x/y" }] })
    );

    expect(
      screen.getByLabelText("View Test Project source on GitHub")
    ).toHaveAttribute("href", "https://github.com/x/y");
  });
});
