import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { projectFields } from "../../validators/project.validators";
import { CASE_STUDIES } from "./case-studies";

const PUBLIC_DIR = path.resolve(__dirname, "../../../../frontend/public");

describe("case study data", () => {
  it.each(CASE_STUDIES.map((entry) => [entry.name, entry] as const))(
    "%s passes the same validation as the admin editor",
    (_name, entry) => {
      expect(() => projectFields.caseStudy.parse(entry.caseStudy)).not.toThrow();
    }
  );

  it("points only at images that exist", () => {
    const missing = CASE_STUDIES.flatMap((entry) =>
      (entry.caseStudy.sections ?? []).flatMap((section) => section.media)
    )
      .map((media) => media.src)
      .filter((src) => !fs.existsSync(path.join(PUBLIC_DIR, src)));

    expect(missing).toEqual([]);
  });

  it("gives every image alt text", () => {
    const media = CASE_STUDIES.flatMap((entry) =>
      (entry.caseStudy.sections ?? []).flatMap((section) => section.media)
    );

    expect(media.length).toBeGreaterThan(0);
    expect(media.every((item) => item.alt?.trim())).toBe(true);
  });

  it("matches the known seed titles and not each other", () => {
    const titles = [
      "The Archive - Stories to explore stress",
      "Food Forward Time Management - NGO",
      "Stress through Story: Co-Design through a board game!",
      "Spam SVM Detection: Filtering Spam Data with ML",
      "Bug Cup Fill",
    ];

    for (const entry of CASE_STUDIES) {
      expect(titles.filter((title) => entry.match.test(title))).toHaveLength(1);
    }
  });
});
