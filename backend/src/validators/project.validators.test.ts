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
    expect(result.order).toBe(0);
  });

  it("accepts all optional fields", () => {
    const result = createProjectSchema.parse({
      ...validProject,
      link: "https://example.com",
      technologies: ["React", "Node.js"],
      featured: true,
      order: 5,
    });
    expect(result.link).toBe("https://example.com");
    expect(result.technologies).toEqual(["React", "Node.js"]);
    expect(result.order).toBe(5);
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

  it("accepts empty object (defaults still apply for defaulted fields)", () => {
    const result = updateProjectSchema.parse({});
    // Fields with .default() still get their defaults even in partial schemas
    expect(result.title).toBeUndefined();
    expect(result.category).toBeUndefined();
  });

  it("still validates provided fields", () => {
    expect(() =>
      updateProjectSchema.parse({ link: "not-a-url" })
    ).toThrow();
  });
});
