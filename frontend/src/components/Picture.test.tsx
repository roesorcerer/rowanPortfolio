import { render, screen } from "@testing-library/react";
import Picture, { srcSet } from "./Picture";

// The manifest is a build output, so whether a given /assets path is in it
// depends on whether the build ran first (in CI it hasn't). These tests use
// a path no build will ever optimize, and test the naming separately.

describe("Picture", () => {
  it("is a plain lazy <img> for a path the build didn't optimize", () => {
    const { container } = render(
      <Picture src="https://example.com/cover.png" alt="Cover" />
    );
    const img = screen.getByRole("img", { name: "Cover" });
    expect(container.querySelector("picture")).toBeNull();
    expect(img).toHaveAttribute("src", "https://example.com/cover.png");
    expect(img).toHaveAttribute("loading", "lazy");
    expect(img).not.toHaveAttribute("fetchpriority");
  });

  it("loads the priority image eagerly and ahead of others", () => {
    render(<Picture src="https://example.com/hero.png" alt="Hero" priority />);
    const img = screen.getByRole("img", { name: "Hero" });
    expect(img).toHaveAttribute("loading", "eager");
    expect(img).toHaveAttribute("fetchpriority", "high");
  });
});

describe("srcSet", () => {
  // Must match scripts/optimize-images.mjs, which writes the files.
  it("names each copy after its source path and width", () => {
    expect(
      srcSet("/assets/thearchive/fiasco.png", { widths: [480, 960] }, "avif")
    ).toBe(
      "/img/thearchive/fiasco-480.avif 480w, /img/thearchive/fiasco-960.avif 960w"
    );
  });
});
