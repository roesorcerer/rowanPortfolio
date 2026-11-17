import { act } from "react";
import { hydrateRoot, type Root } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider, hydrate } from "@tanstack/react-query";
import { screen, waitFor } from "@testing-library/react";
import { render } from "./entry-server";
import { Site } from "./App";
import { createQueryClient } from "./queryClient";
import { beginHydration } from "./lib/hydration";
import type { Project, ProjectSummary } from "./types";

// The prerender step only helps if the browser adopts its HTML. If the
// first browser render differs from the server's by so much as an
// attribute, React throws the HTML away and renders again from scratch, and
// says so only through onRecoverableError. This test does both halves the
// way production does (entry-server's render, then main.tsx's hydrate)
// and fails on any such report.

const project: Project = {
  _id: "p1",
  slug: "food-forward",
  title: "Food Forward",
  category: ["TypeScript", "React Native"],
  description: "Scheduling for a meal delivery nonprofit.",
  image: "/assets/ff9.png",
  links: [{ kind: "github", url: "https://github.com/roesorcerer/ff" }],
  media: [],
  collaborators: [],
  details: [],
  order: 0,
  featured: true,
  projectType: "product",
  status: "published",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-02-01T00:00:00.000Z",
  caseStudy: {
    summary: "How a volunteer schedule moved off paper.",
    role: "Lead developer",
    problem: "Shifts were tracked on paper.",
    sections: [
      { heading: "Interviews", body: "We talked to drivers.", media: [] },
    ],
    outcomes: ["Fewer missed shifts"],
    lessons: ["Ask the drivers first"],
  },
};

const { caseStudy: _omitted, ...card } = project;
const summary: ProjectSummary = { ...card, hasCaseStudy: true };

// Every hydrated root is unmounted after its test. The server renderer and
// the browser one share React's context slots, so a root left mounted and
// re-rendering while the next test's server render runs would corrupt both.
// Production never interleaves them: one runs at build time, the other in
// the visitor's browser.
let mounted: Root | null = null;

async function prerenderThenHydrate(url: string, withProject = false) {
  const { html, state } = await render({
    url,
    projects: [summary],
    project: withProject ? project : undefined,
  });

  window.history.pushState({}, "", url);
  const container = document.createElement("div");
  container.id = "root";
  container.innerHTML = html;
  document.body.replaceChildren(container);

  const queryClient = createQueryClient();
  hydrate(queryClient, JSON.parse(JSON.stringify(state)));

  // As main.tsx does before hydrateRoot.
  beginHydration();
  const recoverable: unknown[] = [];
  await act(async () => {
    mounted = hydrateRoot(
      container,
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Site />
        </BrowserRouter>
      </QueryClientProvider>,
      { onRecoverableError: (error) => recoverable.push(error) }
    );
  });
  return { html, recoverable };
}

describe("prerendered pages hydrate without a mismatch", () => {
  beforeEach(() => {
    // Running both renderers in one process makes React warn that two of
    // them share a context provider. That is this test's doing, not the
    // app's (see `mounted` above), so only that one warning is hidden.
    const consoleError = console.error;
    vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
      if (String(args[0]).includes("multiple renderers concurrently")) return;
      consoleError(...args);
    });
    // The analytics adapter posts a page view on mount; nothing to reach.
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(new Response(null)))
    );
  });

  afterEach(() => {
    act(() => mounted?.unmount());
    mounted = null;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("the landing page, with the project list in its HTML", async () => {
    const { html, recoverable } = await prerenderThenHydrate("/");

    expect(html).toContain("Food Forward");
    expect(html).not.toContain("Loading projects");
    expect(recoverable).toEqual([]);
  });

  it("a permalink, with its case study in its HTML", async () => {
    const { html, recoverable } = await prerenderThenHydrate(
      "/projects/food-forward",
      true
    );

    expect(html).toContain("How a volunteer schedule moved off paper.");
    expect(recoverable).toEqual([]);
    expect(
      screen.getByRole("heading", { level: 1, name: "Food Forward" })
    ).toBeInTheDocument();
  });

  it("the resume, rendered in full rather than a loading fallback", async () => {
    const { html, recoverable } = await prerenderThenHydrate("/resume");

    expect(html).not.toContain("Loading…");
    expect(html).toContain("https://rowan.page/projects/food-forward");
    await waitFor(() => expect(recoverable).toEqual([]));
  });

  // Prerendered pages are built dark. A visitor who chose light switches
  // after hydration; done as a plain update, that switch made React discard
  // the page's server HTML (error #421, found in Chrome).
  it("a visitor who chose the light theme, without losing the HTML", async () => {
    localStorage.setItem("portfolio-theme", "light");
    try {
      const { recoverable } = await prerenderThenHydrate("/");
      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: "Dark mode" })
        ).toBeInTheDocument()
      );
      expect(recoverable).toEqual([]);
    } finally {
      localStorage.removeItem("portfolio-theme");
    }
  });

  it("the 404 page, adopted at whatever address was missed", async () => {
    const { html } = await render({ url: "/404", projects: [summary] });
    expect(html).toContain("There is no page at this address.");

    const { recoverable } = await prerenderThenHydrate("/no-such-page");
    expect(recoverable).toEqual([]);
  });
});
