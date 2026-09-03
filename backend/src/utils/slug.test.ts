import { slugify, isSlug } from "./slug";

describe("slugify", () => {
  it("lowercases and hyphenates a title", () => {
    expect(slugify("Food Forward")).toBe("food-forward");
  });

  it("collapses punctuation and runs of separators", () => {
    expect(slugify("Itasca Trails — a community map!")).toBe(
      "itasca-trails-a-community-map"
    );
  });

  it("folds diacritics rather than dropping the letter", () => {
    expect(slugify("Café Ordering")).toBe("cafe-ordering");
  });

  it("never leaves a leading or trailing hyphen", () => {
    expect(slugify("  ...Portfolio Site...  ")).toBe("portfolio-site");
  });

  // Callers decide what to do with this; returning "-" would be worse.
  it("returns empty for input with nothing usable in it", () => {
    expect(slugify("🎉 !!! ---")).toBe("");
  });

  it("is idempotent", () => {
    expect(slugify(slugify("Food Forward"))).toBe("food-forward");
  });
});

describe("isSlug", () => {
  it("accepts canonical slugs", () => {
    expect(isSlug("food-forward")).toBe(true);
  });

  it("rejects anything slugify would change", () => {
    expect(isSlug("Food Forward")).toBe(false);
    expect(isSlug("food--forward")).toBe(false);
    expect(isSlug("")).toBe(false);
  });
});
