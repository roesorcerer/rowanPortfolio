import {
  hasCaseStudy,
  linkLabel,
  projectPath,
  projectUrl,
  usableLinks,
} from "./projectLinks";

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
  it("is the permalink against the canonical origin", () => {
    // The canonical origin, not wherever the page happens to be open: this is
    // the link a resume prints, and the prerender step has no window.
    expect(projectUrl(project)).toBe(
      "https://rowan.page/projects/food-forward"
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

describe("usableLinks", () => {
  // Until `migrate:link-kinds` has run, stored projects still carry the old
  // kind; every reader should already see the new one.
  it("reads the old github kind as source", () => {
    const links = usableLinks({
      links: [
        { kind: "github", url: "https://github.com/x/y" },
        { kind: "demo", url: "https://x.example" },
      ],
    });
    expect(links.map((link) => link.kind)).toEqual(["source", "demo"]);
    expect(linkLabel(links[0]!, "Live demo")).toBe("View source");
  });

  it("drops links with no URL", () => {
    expect(usableLinks({ links: [{ kind: "source", url: "  " }] })).toEqual([]);
  });
});
