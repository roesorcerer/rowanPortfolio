import { datesLabel, hasExternalLinks, mediaItemsOf, researchStatusOf } from "./projectFacts";
import type { Project } from "../../types";

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    _id: "p1",
    slug: "a-project",
    title: "A project",
    category: [],
    description: "",
    image: "/cover.png",
    links: [],
    media: [],
    collaborators: [],
    details: [],
    featured: false,
    projectType: "product",
    status: "published",
    order: 0,
    createdAt: "2026-01-10T00:00:00.000Z",
    updatedAt: "2026-01-10T00:00:00.000Z",
    ...overrides,
  };
}

describe("researchStatusOf", () => {
  it("is null for anything that isn't research", () => {
    expect(researchStatusOf(makeProject({ projectType: "product" }))).toBeNull();
  });

  it("prefers the status that was set explicitly", () => {
    const project = makeProject({
      projectType: "research",
      researchStatus: "published",
      // Present but overridden — an explicit status is a decision, not a guess.
      details: [
        { key: "originalvenue", label: "Originally submitted to", value: "CSCW 2025" },
      ],
    });

    expect(researchStatusOf(project)).toBe("published");
  });

  it("infers in-revision from a revision trail", () => {
    const project = makeProject({
      projectType: "research",
      details: [
        { key: "originalvenue", label: "Originally submitted to", value: "CSCW 2025" },
      ],
    });

    expect(researchStatusOf(project)).toBe("in-revision");
  });

  it("defaults research with no trail to published", () => {
    expect(researchStatusOf(makeProject({ projectType: "research" }))).toBe("published");
  });
});

describe("datesLabel", () => {
  it("prefers a hand-written development time over timestamps", () => {
    const project = makeProject({ developmentTime: "Summer 2025" });
    expect(datesLabel(project)).toBe("Summer 2025");
  });

  it("collapses to one month when created and updated match", () => {
    expect(datesLabel(makeProject())).toBe("Jan 2026");
  });

  it("shows a range when the project was edited in a later month", () => {
    const project = makeProject({ updatedAt: "2026-04-02T00:00:00.000Z" });
    expect(datesLabel(project)).toBe("Jan 2026 - Apr 2026");
  });

  it("says so rather than rendering an Invalid Date", () => {
    const project = makeProject({ createdAt: "", updatedAt: "" });
    expect(datesLabel(project)).toBe("Not specified");
  });
});

describe("mediaItemsOf", () => {
  it("falls back to the cover image so there is always something to show", () => {
    expect(mediaItemsOf(makeProject())).toEqual([
      { type: "image", src: "/cover.png", alt: "A project" },
    ]);
  });

  it("uses the carousel when one is set", () => {
    const media = [{ type: "video" as const, src: "/demo.mp4" }];
    expect(mediaItemsOf(makeProject({ media }))).toBe(media);
  });
});

describe("hasExternalLinks", () => {
  it("is false when a project points nowhere", () => {
    expect(hasExternalLinks(makeProject())).toBe(false);
  });

  it("is true as soon as one link carries a URL", () => {
    expect(
      hasExternalLinks(makeProject({ links: [{ kind: "github", url: "https://x" }] }))
    ).toBe(true);
    expect(
      hasExternalLinks(makeProject({ links: [{ kind: "itch", url: "https://x" }] }))
    ).toBe(true);
  });

  it("ignores a link row with a blank URL", () => {
    expect(hasExternalLinks(makeProject({ links: [{ kind: "demo", url: "  " }] }))).toBe(
      false
    );
  });
});
