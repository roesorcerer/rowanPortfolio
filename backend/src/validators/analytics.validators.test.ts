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

  it("rejects an eventType outside the declared set", () => {
    expect(() => trackEventSchema.parse({ eventType: "project_veiw" })).toThrow();
    expect(() =>
      trackEventSchema.parse({ eventType: "x".repeat(LIMITS.event.typeMax + 1) })
    ).toThrow();
  });

  // Intake clips, never rejects, on length (docs/adr/0001): an event with a
  // long project title is still a real click.
  it("clips an over-long projectTitle and referrer instead of rejecting them", () => {
    const result = trackEventSchema.parse({
      eventType: "project_view",
      projectTitle: "x".repeat(LIMITS.event.projectTitleMax + 50),
      referrer: "https://r.example/" + "y".repeat(LIMITS.tracking.referrerMax),
    });
    expect(result.projectTitle).toHaveLength(LIMITS.event.projectTitleMax);
    expect(result.referrer).toHaveLength(LIMITS.tracking.referrerMax);
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
