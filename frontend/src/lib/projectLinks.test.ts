import { hasCaseStudy, projectPath, projectUrl } from "./projectLinks";

const project = { _id: "68c0f1", slug: "food-forward" };

describe("projectPath", () => {
  it("builds the permalink from the slug", () => {
    expect(projectPath(project)).toBe("/projects/food-forward");
  });

  // Guards against a backend that hasn't been redeployed: without the
  // fallback this produced "/projects/undefined".
  it("falls back to the id when the slug is missing", () => {
    expect(projectPath({ _id: "68c0f1", slug: "" })).toBe("/projects/68c0f1");
    expect(
      projectPath({ _id: "68c0f1" } as { _id: string; slug: string })
    ).toBe("/projects/68c0f1");
  });
});

describe("projectUrl", () => {
  it("is the permalink against the current origin", () => {
    expect(projectUrl(project)).toBe(
      `${window.location.origin}/projects/food-forward`
    );
  });
});

describe("hasCaseStudy", () => {
  it("is false for an absent or hollow case study", () => {
    expect(hasCaseStudy(undefined)).toBe(false);
    expect(hasCaseStudy({ sections: [], outcomes: [], lessons: [] })).toBe(false);
    expect(
      hasCaseStudy({ summary: "   ", sections: [], outcomes: [], lessons: [] })
    ).toBe(false);
  });

  it("is true as soon as anything is written", () => {
    expect(
      hasCaseStudy({ summary: "How it went.", sections: [], outcomes: [], lessons: [] })
    ).toBe(true);
    expect(
      hasCaseStudy({
        sections: [
          { heading: "Shadowing a shift", body: "Watched two services.", media: [] },
        ],
        outcomes: [],
        lessons: [],
      })
    ).toBe(true);
  });
});
