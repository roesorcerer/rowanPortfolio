import { trackEventSchema } from "./analytics.validators";
import { LIMITS } from "./limits";

describe("trackEventSchema", () => {
  it("accepts an event with only eventType", () => {
    const result = trackEventSchema.parse({ eventType: "project_view" });
    expect(result.eventType).toBe("project_view");
  });

  it("accepts an event with project details", () => {
    const result = trackEventSchema.parse({
      eventType: "link_click",
      projectId: "abc123",
      projectTitle: "Portfolio Site",
      projectType: "featured",
      linkType: "demo",
    });
    expect(result.projectTitle).toBe("Portfolio Site");
    expect(result.linkType).toBe("demo");
  });

  it("rejects missing eventType", () => {
    expect(() => trackEventSchema.parse({})).toThrow();
  });

  it("rejects empty eventType", () => {
    expect(() => trackEventSchema.parse({ eventType: "" })).toThrow();
  });

  it("rejects eventType longer than the limit instead of silently truncating", () => {
    const tooLong = "x".repeat(LIMITS.event.typeMax + 1);
    expect(() => trackEventSchema.parse({ eventType: tooLong })).toThrow();
  });

  it("rejects projectTitle longer than the limit", () => {
    const tooLong = "x".repeat(LIMITS.event.projectTitleMax + 1);
    expect(() =>
      trackEventSchema.parse({ eventType: "project_view", projectTitle: tooLong })
    ).toThrow();
  });

  it("trims whitespace from string fields", () => {
    const result = trackEventSchema.parse({
      eventType: "  project_view  ",
      projectTitle: "  My Project  ",
    });
    expect(result.eventType).toBe("project_view");
    expect(result.projectTitle).toBe("My Project");
  });
});
