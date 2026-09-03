import { describe, expect, it } from "vitest";
import type { Project } from "../types";
import {
  DETAIL_KEYS,
  detailFor,
  detailValue,
  detailsExcept,
  filledDetails,
  hasRevisionTrail,
} from "./projectDetails";

function withDetails(details: Project["details"]): Pick<Project, "details"> {
  return { details };
}

describe("detail lookup", () => {
  it("finds a detail by key regardless of how it was cased", () => {
    const project = withDetails([
      { key: "Venue", label: "Venue", value: "CHI EA 2026" },
    ]);

    expect(detailValue(project, DETAIL_KEYS.venue)).toBe("CHI EA 2026");
    expect(detailFor(project, "VENUE")?.label).toBe("Venue");
  });

  it("treats a blank value as absent", () => {
    const project = withDetails([{ key: "venue", label: "Venue", value: "   " }]);

    expect(detailValue(project, DETAIL_KEYS.venue)).toBeUndefined();
    expect(filledDetails(project)).toEqual([]);
  });

  it("returns undefined rather than throwing when there are no details", () => {
    expect(detailValue({ details: [] }, DETAIL_KEYS.venue)).toBeUndefined();
  });
});

describe("detailsExcept", () => {
  it("holds back the keys a surface renders itself", () => {
    const project = withDetails([
      { key: "venue", label: "Venue", value: "CHI EA 2026" },
      { key: "engine", label: "Engine", value: "Unity 6" },
    ]);

    expect(detailsExcept(project, ["venue"]).map((d) => d.key)).toEqual(["engine"]);
  });

  it("keeps authored order", () => {
    const project = withDetails([
      { key: "b", label: "B", value: "2" },
      { key: "a", label: "A", value: "1" },
    ]);

    expect(detailsExcept(project, []).map((d) => d.key)).toEqual(["b", "a"]);
  });
});

describe("hasRevisionTrail", () => {
  it("is true when any part of the trail is written", () => {
    expect(
      hasRevisionTrail(
        withDetails([
          { key: DETAIL_KEYS.originalVenue, label: "Originally", value: "CSCW 2025" },
        ])
      )
    ).toBe(true);
  });

  it("is false for a paper carrying only ordinary facts", () => {
    expect(
      hasRevisionTrail(
        withDetails([{ key: "venue", label: "Venue", value: "CHI EA 2026" }])
      )
    ).toBe(false);
  });
});
