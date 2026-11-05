import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useProjects } from "../hooks/useProjects";
import type { Project } from "../types";
import WorkSection from "./WorkSection";

vi.mock("../hooks/useProjects", () => ({ useProjects: vi.fn() }));
vi.mock("../analytics", () => ({ useAnalytics: () => ({ linkClick: vi.fn() }) }));

const project = (title: string, extra: Partial<Project>) =>
  ({
    _id: title,
    slug: title.toLowerCase(),
    title,
    description: `${title} description`,
    category: [],
    links: [],
    featured: false,
    projectType: "product",
    ...extra,
  }) as Project;

const PROJECTS = [
  project("Archive", {
    featured: true,
    category: ["TypeScript"],
    caseStudy: { summary: "Written", sections: [], outcomes: [], lessons: [] },
    links: [{ kind: "github", url: "https://github.com/roesorcerer/thearchive" }],
  }),
  project("Forward", { category: ["TypeScript"] }),
  project("Cup", { projectType: "gameDev", category: ["Godot"] }),
];

function renderWork() {
  vi.mocked(useProjects).mockReturnValue({
    data: PROJECTS,
    isLoading: false,
    error: null,
  } as unknown as ReturnType<typeof useProjects>);
  render(
    <MemoryRouter>
      <WorkSection />
    </MemoryRouter>
  );
}

const types = () => within(screen.getByRole("group", { name: "Project type" }));

describe("WorkSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("opens on featured work, linked to its case study", () => {
    renderWork();
    expect(screen.getByRole("link", { name: "Archive" })).toHaveAttribute("href", "/projects/archive");
    expect(screen.getByRole("link", { name: "Read the case study" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Forward" })).not.toBeInTheDocument();
  });

  it("hides a tab with nothing in it", () => {
    renderWork();
    expect(types().getByRole("button", { name: "Game Dev 1" })).toBeInTheDocument();
    expect(types().queryByRole("button", { name: /^Art/ })).not.toBeInTheDocument();
  });

  it("only offers skills that more than one project shares", () => {
    renderWork();
    const skills = within(screen.getByRole("group", { name: "Filter by skill" }));
    expect(skills.getByRole("button", { name: "TypeScript 2" })).toBeInTheDocument();
    expect(skills.queryByRole("button", { name: /Godot/ })).not.toBeInTheDocument();
  });

  it("filters across tabs by skill, and clears on a second press", async () => {
    const user = userEvent.setup();
    renderWork();
    const skill = screen.getByRole("button", { name: "TypeScript 2" });

    await user.click(skill);
    expect(screen.getByText(/2 projects use TypeScript/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Forward" })).toBeInTheDocument();

    await user.click(skill);
    expect(screen.queryByRole("link", { name: "Forward" })).not.toBeInTheDocument();
  });
});
