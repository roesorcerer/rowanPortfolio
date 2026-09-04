import { createProjectSchema, updateProjectSchema } from "./project.validators";

describe("createProjectSchema", () => {
  const validProject = {
    title: "Test Project",
    category: "Web App",
    description: "A test project",
    image: "/assets/test.png",
  };

  it("accepts valid project data with required fields only", () => {
    const result = createProjectSchema.parse(validProject);
    expect(result.title).toBe("Test Project");
    // Defaults should be applied
    expect(result.links).toEqual([]);
    expect(result.featured).toBe(false);
    // New projects start hidden rather than going live half-finished.
    expect(result.status).toBe("draft");
    // No order: the store appends to the end of the display group.
    expect(result.order).toBeUndefined();
  });

  it("accepts all optional fields", () => {
    const result = createProjectSchema.parse({
      ...validProject,
      links: [{ kind: "demo", url: "https://example.com" }],
      category: ["Web App", "React"],
      featured: true,
      status: "published",
      order: 5,
    });
    expect(result.links).toEqual([{ kind: "demo", url: "https://example.com" }]);
    expect(result.category).toEqual(["Web App", "React"]);
    expect(result.featured).toBe(true);
    expect(result.status).toBe("published");
    expect(result.order).toBe(5);
  });

  it("coerces a bare string category into a tag array", () => {
    const result = createProjectSchema.parse({ ...validProject, category: "Web App" });
    expect(result.category).toEqual(["Web App"]);
  });

  it("trims category tags and drops blank ones", () => {
    const result = createProjectSchema.parse({
      ...validProject,
      category: ["  Web App  ", "", "   ", "Research"],
    });
    expect(result.category).toEqual(["Web App", "Research"]);
  });

  it("rejects a projectType of 'featured' — promotion is the boolean", () => {
    expect(() =>
      createProjectSchema.parse({ ...validProject, projectType: "featured" })
    ).toThrow();
  });

  it("rejects the retired 'rejected' research status", () => {
    expect(() =>
      createProjectSchema.parse({ ...validProject, researchStatus: "rejected" })
    ).toThrow();
  });

  it("rejects missing title", () => {
    expect(() =>
      createProjectSchema.parse({ ...validProject, title: undefined })
    ).toThrow();
  });

  it("rejects title exceeding 200 characters", () => {
    expect(() =>
      createProjectSchema.parse({ ...validProject, title: "a".repeat(201) })
    ).toThrow();
  });

  it("rejects invalid link URL", () => {
    expect(() =>
      createProjectSchema.parse({
        ...validProject,
        links: [{ kind: "demo", url: "not-a-url" }],
      })
    ).toThrow();
  });

  it("trims title whitespace", () => {
    const result = createProjectSchema.parse({
      ...validProject,
      title: "  Trimmed Title  ",
    });
    expect(result.title).toBe("Trimmed Title");
  });
});

describe("updateProjectSchema", () => {
  it("accepts partial data (all fields optional)", () => {
    const result = updateProjectSchema.parse({ title: "Updated" });
    expect(result.title).toBe("Updated");
    expect(result.category).toBeUndefined();
  });

  it("accepts empty object", () => {
    const result = updateProjectSchema.parse({});
    expect(result.title).toBeUndefined();
    expect(result.category).toBeUndefined();
  });

  it("never injects create-time defaults into a partial update", () => {
    // A PUT of one field must not overwrite the rest. If .default() leaked
    // into this schema, editing a title would clear tags and technologies,
    // un-feature the project, and flip it back to a draft.
    const result = updateProjectSchema.parse({ title: "Updated" });
    expect(result).toEqual({ title: "Updated" });
  });

  it("still validates provided fields", () => {
    expect(() =>
      updateProjectSchema.parse({ links: [{ kind: "demo", url: "not-a-url" }] })
    ).toThrow();
  });
});

describe("details", () => {
  it("normalizes keys to lowercase so lookups by key are stable", () => {
    const parsed = createProjectSchema.parse({
      title: "T",
      description: "D",
      image: "/i.png",
      details: [{ key: "Venue", label: "Venue", value: "CHI EA 2026" }],
    });

    expect(parsed.details[0].key).toBe("venue");
  });

  it("collapses duplicate keys last-wins rather than rejecting the save", () => {
    const parsed = createProjectSchema.parse({
      title: "T",
      description: "D",
      image: "/i.png",
      details: [
        { key: "venue", label: "Venue", value: "CSCW 2025" },
        { key: "venue", label: "Published in", value: "CHI EA 2026" },
      ],
    });

    expect(parsed.details).toEqual([
      { key: "venue", label: "Published in", value: "CHI EA 2026" },
    ]);
  });

  it("defaults to an empty list on create", () => {
    const parsed = createProjectSchema.parse({
      title: "T",
      description: "D",
      image: "/i.png",
    });

    expect(parsed.details).toEqual([]);
  });

  // The guard the file's own comment describes: a default leaking into the
  // update schema would let a PUT of {title} silently wipe every detail.
  it("does NOT default on update — an untouched field stays untouched", () => {
    const parsed = updateProjectSchema.parse({ title: "Renamed" });

    expect(parsed).not.toHaveProperty("details");
  });

  it("still writes an explicitly emptied list, so details can be cleared", () => {
    const parsed = updateProjectSchema.parse({ details: [] });

    expect(parsed.details).toEqual([]);
  });

  it("rejects a detail with no value", () => {
    const result = createProjectSchema.safeParse({
      title: "T",
      description: "D",
      image: "/i.png",
      details: [{ key: "venue", label: "Venue", value: "" }],
    });

    expect(result.success).toBe(false);
  });
});

describe("links", () => {
  const base = { title: "T", description: "D", image: "/i.png" };

  it("normalizes kind to lowercase so lookups by kind are stable", () => {
    const parsed = createProjectSchema.parse({
      ...base,
      links: [{ kind: "GitHub", url: "https://github.com/x/y" }],
    });

    expect(parsed.links[0].kind).toBe("github");
  });

  it("accepts a kind the UI has never heard of", () => {
    // The point of an open kind: a new destination is data, not a migration.
    const parsed = createProjectSchema.parse({
      ...base,
      links: [{ kind: "itch", url: "https://x.itch.io/y", label: "Play on itch.io" }],
    });

    expect(parsed.links[0]).toEqual({
      kind: "itch",
      url: "https://x.itch.io/y",
      label: "Play on itch.io",
    });
  });

  it("rejects a malformed URL", () => {
    const result = createProjectSchema.safeParse({
      ...base,
      links: [{ kind: "demo", url: "not-a-url" }],
    });

    expect(result.success).toBe(false);
  });

  it("does NOT default on update — an untouched field stays untouched", () => {
    expect(updateProjectSchema.parse({ title: "Renamed" })).not.toHaveProperty("links");
  });
});

describe("merged category tags", () => {
  const base = { title: "T", description: "D", image: "/i.png" };

  it("de-duplicates case-insensitively, keeping the casing first typed", () => {
    // The merge folds `technologies` into `category`, and the two overlapped —
    // "Co-Design" and "Research" appeared in both on real records.
    const parsed = createProjectSchema.parse({
      ...base,
      category: ["Co-Design", "React", "co-design", "REACT", "HCI"],
    });

    expect(parsed.category).toEqual(["Co-Design", "React", "HCI"]);
  });
});

describe("size limits", () => {
  const base = { title: "T", description: "D", image: "/i.png" };

  // A pasted data: URI is what makes a project too big to save. It is caught
  // as a field error naming the fix, not as a transport-level 413.
  it("rejects an inline data URI as an image, with a message saying what to do", () => {
    const dataUri = "data:image/png;base64," + "A".repeat(5000);
    const result = createProjectSchema.safeParse({ ...base, image: dataUri });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/frontend\/public\/assets/);
    }
  });

  it("rejects a data URI in a media source too", () => {
    const result = createProjectSchema.safeParse({
      ...base,
      media: [{ type: "image", src: "data:image/png;base64," + "A".repeat(5000) }],
    });

    expect(result.success).toBe(false);
  });

  it("still accepts an ordinary path and an ordinary URL", () => {
    const parsed = createProjectSchema.parse({
      ...base,
      image: "/assets/a-real-file.png",
      media: [{ type: "image", src: "https://example.com/a/perfectly/normal/image.png" }],
    });

    expect(parsed.image).toBe("/assets/a-real-file.png");
  });

  // The case that produced the 413: real prose, no images pasted in.
  it("accepts a full case study of real prose", () => {
    const paragraph = "Ten words of plausible case-study prose, repeated. ".repeat(60);
    const parsed = createProjectSchema.parse({
      ...base,
      description: "A".repeat(1400),
      caseStudy: {
        summary: paragraph.slice(0, 3000),
        role: paragraph.slice(0, 1000),
        problem: paragraph.slice(0, 2000),
        sections: Array.from({ length: 8 }, (_, i) => ({
          heading: `Step ${i + 1}`,
          body: paragraph.slice(0, 3000),
        })),
        outcomes: Array.from({ length: 8 }, () => "Something that came out of it"),
        lessons: Array.from({ length: 8 }, () => "Something to carry forward"),
      },
    });

    expect(parsed.caseStudy?.sections).toHaveLength(8);
    // Comfortably inside the 512kb body limit, which the old 10kb was not.
    expect(JSON.stringify(parsed).length).toBeLessThan(100_000);
  });

  it("rejects a section body past the cap", () => {
    const result = createProjectSchema.safeParse({
      ...base,
      caseStudy: { sections: [{ heading: "H", body: "A".repeat(9000) }] },
    });

    expect(result.success).toBe(false);
  });
});
