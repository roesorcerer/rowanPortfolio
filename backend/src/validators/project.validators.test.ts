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
    expect(result.technologies).toEqual([]);
    expect(result.featured).toBe(false);
    // New projects start hidden rather than going live half-finished.
    expect(result.status).toBe("draft");
    // No order: the store appends to the end of the display group.
    expect(result.order).toBeUndefined();
  });

  it("accepts all optional fields", () => {
    const result = createProjectSchema.parse({
      ...validProject,
      link: "https://example.com",
      technologies: ["React", "Node.js"],
      featured: true,
      status: "published",
      order: 5,
    });
    expect(result.link).toBe("https://example.com");
    expect(result.technologies).toEqual(["React", "Node.js"]);
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
      createProjectSchema.parse({ ...validProject, link: "not-a-url" })
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
      updateProjectSchema.parse({ link: "not-a-url" })
    ).toThrow();
  });
});
