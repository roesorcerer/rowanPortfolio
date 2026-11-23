import { DEFAULT_IMAGE, HOME_META, headTags, projectMeta } from "./seo";
import type { Project } from "./types";

const project: Project = {
  _id: "p1",
  slug: "food-forward",
  title: "Food Forward",
  category: ["TypeScript", "React Native"],
  description: "Scheduling for a meal delivery nonprofit.",
  image: "/assets/ff9.png",
  links: [],
  media: [],
  collaborators: [],
  details: [],
  order: 0,
  featured: false,
  projectType: "product",
  status: "published",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-02-01T00:00:00.000Z",
  caseStudy: {
    summary: "How a volunteer schedule moved off paper.",
    sections: [],
    outcomes: [],
    lessons: [],
  },
};

// The JSON-LD block out of a page's head, parsed as a crawler would.
function structuredData(html: string): Record<string, unknown> {
  const match = html.match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/
  );
  if (!match?.[1]) throw new Error("no ld+json block");
  return JSON.parse(match[1]) as Record<string, unknown>;
}

describe("projectMeta", () => {
  it("prefers a written search description over the case study summary", () => {
    const meta = projectMeta({
      ...project,
      metaDescription: "A shift app for a food pantry.",
    });
    expect(meta.description).toBe("A shift app for a food pantry.");
  });

  it("falls back to the summary, then the card blurb", () => {
    expect(projectMeta(project).description).toBe(
      "How a volunteer schedule moved off paper."
    );
    expect(projectMeta({ ...project, caseStudy: undefined }).description).toBe(
      "Scheduling for a meal delivery nonprofit."
    );
  });

  it("clips a long blurb at a word, under the search-result length", () => {
    const long = `${"word ".repeat(60)}end`;
    const { description } = projectMeta({
      ...project,
      caseStudy: undefined,
      description: long,
    });
    expect(description.length).toBeLessThanOrEqual(155);
    expect(description.endsWith("word…")).toBe(true);
  });

  it("describes a paper as a ScholarlyArticle and anything else as a CreativeWork", () => {
    const paper = structuredData(
      headTags(projectMeta({ ...project, projectType: "research" }))
    );
    const app = structuredData(headTags(projectMeta(project)));
    expect(paper["@type"]).toBe("ScholarlyArticle");
    expect(app["@type"]).toBe("CreativeWork");
    expect(app).toMatchObject({
      name: "Food Forward",
      url: "https://rowan.page/projects/food-forward",
      image: "https://rowan.page/assets/ff9.png",
      dateModified: "2026-02-01T00:00:00.000Z",
      author: { "@id": "https://rowan.page/#person" },
    });
  });
});

describe("headTags", () => {
  it("gives a page with no image the default preview, at its real size", () => {
    const html = headTags(HOME_META);
    expect(html).toContain(
      `<meta property="og:image" content="${DEFAULT_IMAGE.url}" />`
    );
    expect(html).toContain(`<meta property="og:image:width" content="1200" />`);
    expect(html).toContain(
      `<meta name="twitter:card" content="summary_large_image" />`
    );
  });

  it("uses a project's cover as its preview, without guessing its size", () => {
    const html = headTags(projectMeta(project));
    expect(html).toContain(
      `<meta property="og:image" content="https://rowan.page/assets/ff9.png" />`
    );
    expect(html).not.toContain("og:image:width");
    expect(html).toContain(
      `<meta property="article:modified_time" content="2026-02-01T00:00:00.000Z" />`
    );
  });

  it("marks the home page as the person the projects point to", () => {
    expect(structuredData(headTags(HOME_META))).toMatchObject({
      "@type": "Person",
      "@id": "https://rowan.page/#person",
    });
  });

  // A title containing "</script>" must not end the block and let the rest
  // of the JSON run as HTML.
  it("keeps the JSON-LD block closed whatever the project text says", () => {
    const html = headTags(
      projectMeta({ ...project, title: "</script><script>alert(1)</script>" })
    );
    expect(html.match(/<\/script>/g)).toHaveLength(1);
    expect(structuredData(html).name).toBe(
      "</script><script>alert(1)</script>"
    );
  });
});
