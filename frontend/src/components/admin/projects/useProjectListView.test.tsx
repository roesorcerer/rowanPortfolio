import { act, renderHook } from "@testing-library/react";
import { useProjectListView } from "./useProjectListView";
import { reorderIds } from "./ProjectGroupSection";
import { projectGaps, projectMetaParts } from "./projectTaxonomy";
import type { Project } from "../../../types";

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    _id: Math.random().toString(36).slice(2),
    title: "A project",
    category: ["Web App"],
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

const atrium = makeProject({
  _id: "atrium",
  title: "The Atrium",
  projectType: "product",
  category: ["Mobile app"],
  technologies: ["React Native", "Django"],
  featured: true,
  order: 0,
});
const foodForward = makeProject({
  _id: "food",
  title: "Food Forward",
  projectType: "product",
  category: ["Web app"],
  featured: true,
  order: 1,
});
const itasca = makeProject({
  _id: "itasca",
  title: "Itasca Explorer",
  projectType: "product",
  category: ["Web app"],
  description: "",
  featured: true,
  status: "draft",
  order: 2,
});
const stress = makeProject({
  _id: "stress",
  title: "Stress through story",
  projectType: "research",
  category: ["Research paper"],
  researchStatus: "published",
  researchVenue: "CSCW",
  researchYear: 2026,
  order: 0,
});
const vantage = makeProject({
  _id: "vantage",
  title: "Vantage",
  projectType: "research",
  category: ["Research paper"],
  researchStatus: "in-revision",
  rejectedVenue: "CHI EA 2025",
  order: 1,
});
const spam = makeProject({
  _id: "spam",
  title: "Spam SVM",
  category: ["Machine learning"],
  order: 0,
});

const projects = [atrium, foodForward, itasca, stress, vantage, spam];

function view(list: Project[] = projects) {
  return renderHook(() => useProjectListView(list));
}

describe("grouping", () => {
  it("hoists featured projects out of their type group", () => {
    const { result } = view();

    const labels = result.current.groups.map((g) => g.label);
    expect(labels).toEqual(["Featured", "Research", "Practice"]);

    // All three products are featured, so no Product group is left over.
    const featured = result.current.groups[0]!;
    expect(featured.projects.map((p) => p._id)).toEqual([
      "atrium",
      "food",
      "itasca",
    ]);
  });

  it("orders each group by its own scoped order", () => {
    const { result } = view();

    const research = result.current.groups.find((g) => g.label === "Research")!;
    expect(research.projects.map((p) => p._id)).toEqual(["stress", "vantage"]);
  });

  it("counts drafts across the whole list", () => {
    const { result } = view();
    expect(result.current.total).toBe(6);
    expect(result.current.drafts).toBe(1);
  });
});

describe("chip filters", () => {
  it("counts types independently of promotion, so they overlap with Featured", () => {
    const { result } = view();

    const counts = Object.fromEntries(
      result.current.chipCounts.map((c) => [c.filter, c.count])
    );
    // The three products are also the three featured entries.
    expect(counts).toEqual({
      all: 6,
      product: 3,
      research: 2,
      practice: 1,
      featured: 3,
      drafts: 1,
    });
  });

  it("omits types nothing uses", () => {
    const { result } = view();
    const filters = result.current.chipCounts.map((c) => c.filter);
    expect(filters).not.toContain("art");
    expect(filters).not.toContain("gameDev");
  });

  it("filters to drafts only", () => {
    const { result } = view();

    act(() => result.current.setChip("drafts"));

    expect(result.current.groups.flatMap((g) => g.projects).map((p) => p._id)).toEqual(
      ["itasca"]
    );
  });

  it("filters by type across the promotion boundary", () => {
    const { result } = view();

    act(() => result.current.setChip("product"));

    // All products are featured, so they surface under the Featured group.
    expect(result.current.visibleCount).toBe(3);
  });
});

describe("search", () => {
  it("matches title, tags and technologies", () => {
    const { result } = view();

    act(() => result.current.setSearch("django"));
    expect(result.current.visibleCount).toBe(1);

    act(() => result.current.setSearch("web app"));
    expect(result.current.visibleCount).toBe(2);

    act(() => result.current.setSearch("stress"));
    expect(result.current.visibleCount).toBe(1);
  });

  it("reports nothing to show without pretending the list is empty", () => {
    const { result } = view();

    act(() => result.current.setSearch("nothing matches this"));

    expect(result.current.groups).toEqual([]);
    expect(result.current.isFiltered).toBe(true);
    expect(result.current.total).toBe(6);
  });
});

describe("tag filter", () => {
  it("offers every tag in use, de-duplicated", () => {
    const { result } = view();
    expect(result.current.availableTags).toEqual([
      "Machine learning",
      "Mobile app",
      "Research paper",
      "Web app",
    ]);
  });

  it("treats tags that differ only in case as one tag", () => {
    const { result } = view([
      makeProject({ _id: "a", category: ["Web App"] }),
      makeProject({ _id: "b", category: ["web app"] }),
    ]);

    expect(result.current.availableTags).toEqual(["Web App"]);

    act(() => result.current.setTags(["Web App"]));
    expect(result.current.visibleCount).toBe(2);
  });

  it("ORs across selected tags", () => {
    const { result } = view();

    act(() => result.current.setTags(["Mobile app"]));
    expect(result.current.visibleCount).toBe(1);

    act(() => result.current.setTags(["Mobile app", "Web app"]));
    expect(result.current.visibleCount).toBe(3);
  });
});

describe("reorderability", () => {
  it("allows dragging a whole group in manual order", () => {
    const { result } = view();

    const research = result.current.groups.find((g) => g.label === "Research")!;
    expect(research.reorderable).toBe(true);
  });

  it("refuses to drag a group the filters have cut in half", () => {
    const { result } = view();

    act(() => result.current.setSearch("stress"));

    const research = result.current.groups.find((g) => g.label === "Research")!;
    // Writing indices for a subset would reorder rows you can't see.
    expect(research.projects).toHaveLength(1);
    expect(research.total).toBe(2);
    expect(research.reorderable).toBe(false);
  });

  it("refuses to drag when sorted by anything but manual order", () => {
    const { result } = view();

    act(() => result.current.setSortBy("title"));

    expect(result.current.groups.every((g) => !g.reorderable)).toBe(true);
  });

  it("refuses to drag when grouped by status, which cuts across order groups", () => {
    const { result } = view();

    act(() => result.current.setGroupBy("status"));

    expect(result.current.groups.map((g) => g.label)).toEqual([
      "Drafts",
      "Published",
    ]);
    expect(result.current.groups.every((g) => !g.reorderable)).toBe(true);
  });

  it("refuses to drag a single-item group", () => {
    const { result } = view();
    const practice = result.current.groups.find((g) => g.label === "Practice")!;
    expect(practice.reorderable).toBe(false);
  });
});

describe("reorderIds", () => {
  const ids = ["a", "b", "c", "d"];

  it("moves an item down to the drop position", () => {
    expect(reorderIds(ids, "a", "c")).toEqual(["b", "c", "a", "d"]);
  });

  it("moves an item up to the drop position", () => {
    expect(reorderIds(ids, "d", "b")).toEqual(["a", "d", "b", "c"]);
  });

  it("returns the full group, not just the moved pair", () => {
    // The endpoint rewrites every index it's sent, so a partial list would
    // renumber the group wrong.
    expect(reorderIds(ids, "a", "b")).toHaveLength(ids.length);
  });

  it("treats a drop onto itself as a no-op", () => {
    expect(reorderIds(ids, "a", "a")).toBeNull();
  });

  it("ignores an id that isn't in the group", () => {
    expect(reorderIds(ids, "a", "zzz")).toBeNull();
    expect(reorderIds(ids, "zzz", "a")).toBeNull();
  });

  it("leaves the input array untouched", () => {
    const original = [...ids];
    reorderIds(ids, "a", "c");
    expect(ids).toEqual(original);
  });
});

describe("sorting", () => {
  it("sorts by title when asked", () => {
    const { result } = view();

    act(() => result.current.setGroupBy("none"));
    act(() => result.current.setSortBy("title"));

    expect(result.current.groups[0]!.projects.map((p) => p.title)).toEqual([
      "Food Forward",
      "Itasca Explorer",
      "Spam SVM",
      "Stress through story",
      "The Atrium",
      "Vantage",
    ]);
  });
});

describe("row derivations", () => {
  it("reads research rows as a citation stub", () => {
    expect(projectMetaParts(stress)).toEqual(["CSCW 2026"]);
  });

  it("shows where an in-revision paper was originally submitted", () => {
    expect(projectMetaParts(vantage)).toEqual(["originally CHI EA 2025"]);
  });

  it("reads other rows as tags then tech", () => {
    expect(projectMetaParts(atrium)).toEqual([
      "Mobile app",
      "React Native, Django",
    ]);
  });

  it("surfaces what a half-finished entry is missing", () => {
    expect(projectGaps(itasca)).toContain("missing description");
    expect(projectGaps(atrium)).toEqual([]);
  });
});

describe("clearFilters", () => {
  it("puts every axis back", () => {
    const { result } = view();

    act(() => {
      result.current.setSearch("stress");
      result.current.setChip("research");
      result.current.setTags(["Web app"]);
    });
    act(() => result.current.clearFilters());

    expect(result.current.isFiltered).toBe(false);
    expect(result.current.visibleCount).toBe(6);
  });
});
