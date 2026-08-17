import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProjectsTab from "./ProjectsTab";
import * as projectsApi from "../../api/projects";
import { ApiError } from "../../api/client";
import type { Project } from "../../types";

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    _id: "id",
    title: "A project",
    category: ["Web app"],
    description: "Something",
    image: "/x.png",
    technologies: ["React"],
    featured: false,
    projectType: "practice",
    status: "published",
    order: 0,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

const projects: Project[] = [
  makeProject({
    _id: "atrium",
    title: "The Atrium",
    projectType: "product",
    category: ["Mobile app"],
    technologies: ["React Native", "Django"],
    featured: true,
    order: 0,
  }),
  makeProject({
    _id: "itasca",
    title: "Itasca Explorer",
    projectType: "product",
    description: "",
    featured: true,
    status: "draft",
    order: 1,
  }),
  makeProject({
    _id: "stress",
    title: "Stress through story",
    projectType: "research",
    category: ["Research paper"],
    researchStatus: "published",
    researchVenue: "CSCW",
    researchYear: 2026,
    order: 0,
  }),
];

function renderTab() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <ProjectsTab />
    </QueryClientProvider>
  );
}

beforeEach(() => {
  vi.spyOn(projectsApi, "getAllProjects").mockResolvedValue(projects);
});

describe("ProjectsTab", () => {
  it("reads the admin endpoint so drafts are visible", async () => {
    renderTab();

    await screen.findByText("The Atrium");
    expect(projectsApi.getAllProjects).toHaveBeenCalled();
    expect(screen.getByText("Itasca Explorer")).toBeInTheDocument();
    expect(screen.getByText("Draft")).toBeInTheDocument();
  });

  it("summarises the total and the draft count", async () => {
    renderTab();
    expect(await screen.findByText("3 total · 1 draft")).toBeInTheDocument();
  });

  it("groups featured work above the remaining types", async () => {
    renderTab();
    await screen.findByText("The Atrium");

    const headings = screen
      .getAllByRole("button", { expanded: true })
      .map((el) => el.textContent);

    expect(headings[0]).toContain("Featured");
    expect(headings[1]).toContain("Research");
  });

  it("shows what a half-finished entry is missing", async () => {
    renderTab();
    await screen.findByText("Itasca Explorer");
    expect(screen.getByText(/missing description/)).toBeInTheDocument();
  });

  it("narrows the list as you search", async () => {
    const user = userEvent.setup();
    renderTab();
    await screen.findByText("The Atrium");

    await user.type(screen.getByLabelText("Search projects"), "django");

    expect(screen.getByText("The Atrium")).toBeInTheDocument();
    expect(screen.queryByText("Stress through story")).not.toBeInTheDocument();
  });

  it("filters to drafts from the chip bar", async () => {
    const user = userEvent.setup();
    renderTab();
    await screen.findByText("The Atrium");

    await user.click(screen.getByRole("button", { name: /Drafts 1/ }));

    expect(screen.getByText("Itasca Explorer")).toBeInTheDocument();
    expect(screen.queryByText("The Atrium")).not.toBeInTheDocument();
  });

  it("collapses a group without losing its count", async () => {
    const user = userEvent.setup();
    renderTab();
    await screen.findByText("Stress through story");

    // Scoped by aria-expanded: the chip bar has a "Research" button too.
    const heading = screen
      .getAllByRole("button", { expanded: true })
      .find((el) => el.textContent?.includes("Research"))!;
    await user.click(heading);

    expect(screen.queryByText("Stress through story")).not.toBeInTheDocument();
    expect(heading).toHaveAttribute("aria-expanded", "false");
    expect(heading.textContent).toContain("1");
  });

  it("offers drag only on a complete group in manual order", async () => {
    const user = userEvent.setup();
    renderTab();
    await screen.findByText("The Atrium");

    // Featured holds both promoted projects, so it can be reordered.
    expect(screen.getAllByText("drag to reorder")).toHaveLength(1);

    await user.selectOptions(
      screen.getByLabelText("Sort projects by"),
      "title"
    );

    expect(screen.queryByText("drag to reorder")).not.toBeInTheDocument();
  });

  it("gives reorderable rows a drag handle", async () => {
    renderTab();
    await screen.findByText("The Atrium");

    // Featured is complete and in manual order, so its rows carry handles.
    expect(screen.getByLabelText("Reorder The Atrium")).toBeInTheDocument();
    // Research has one row, so there's nothing to reorder against.
    expect(
      screen.queryByLabelText("Reorder Stress through story")
    ).not.toBeInTheDocument();
  });

  it("reports a failed load instead of claiming there are no projects", async () => {
    // A stale backend without /api/projects/all 404s. Rendering that as
    // "No projects yet. Create your first one." reads as data loss.
    vi.spyOn(projectsApi, "getAllProjects").mockRejectedValue(
      new ApiError(404, "Project not found")
    );

    renderTab();

    expect(await screen.findByText("Couldn't load projects")).toBeInTheDocument();
    expect(screen.getByText(/older build/)).toBeInTheDocument();
    expect(screen.queryByText(/No projects yet/)).not.toBeInTheDocument();
  });

  it("names the cause for the other ways the admin list can fail", async () => {
    vi.spyOn(projectsApi, "getAllProjects").mockRejectedValue(
      new ApiError(401, "Invalid or expired token")
    );

    renderTab();

    expect(await screen.findByText(/session has expired/)).toBeInTheDocument();
  });

  it("opens the form with the tags already in use as suggestions", async () => {
    const user = userEvent.setup();
    renderTab();
    await screen.findByText("The Atrium");

    await user.click(screen.getByRole("button", { name: "+ New project" }));

    expect(screen.getByText("New project")).toBeInTheDocument();
    expect(screen.getByText("Tags")).toBeInTheDocument();
    // Suggestions are drawn from the loaded projects.
    expect(screen.getByRole("button", { name: "+ Mobile app" })).toBeInTheDocument();
  });
});
