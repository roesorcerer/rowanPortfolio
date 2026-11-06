import { describe, expect, it } from "vitest";
import type { CaseStudyEntry } from "./data/case-studies";
import { pickCaseStudies } from "./pick-case-studies";

const entry = (name: string) =>
  ({ name, match: /x/, caseStudy: {} }) as unknown as CaseStudyEntry;

const entries = [entry("The Archive"), entry("Food Forward"), entry("Bug Cup Fill")];

describe("pickCaseStudies", () => {
  it("returns every entry when --only is not passed", () => {
    expect(pickCaseStudies(entries, ["--dry"])).toEqual(entries);
  });

  it("keeps only the entries whose name contains the --only value, ignoring case", () => {
    const picked = pickCaseStudies(entries, ["--only", "BUG", "--dry"]);
    expect(picked.map((e) => e.name)).toEqual(["Bug Cup Fill"]);
  });

  it("throws when --only has no value", () => {
    expect(() => pickCaseStudies(entries, ["--only"])).toThrow(/needs a name/);
    expect(() => pickCaseStudies(entries, ["--only", "--dry"])).toThrow(/needs a name/);
  });

  it("throws and lists the names when nothing matches", () => {
    expect(() => pickCaseStudies(entries, ["--only", "nope"])).toThrow(
      /matches no case study.*"Bug Cup Fill"/
    );
  });
});
