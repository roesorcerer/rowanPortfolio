import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { projectList, projectsBySlug } from "./fixtures";

// The accessibility gate: every public page, in both themes, scanned by axe
// against WCAG 2.2 AA (design doc 6.4 and 8.1). A violation fails CI.
//
// A scanner finds roughly a third of real accessibility problems, so this
// is a floor that stops regressions, not a sign-off: keyboard and screen
// reader passes by hand are still part of 6.4. What it does catch reliably
// is what the audit found most of (F9, F10): contrast, names, nesting.

const WCAG_AA = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

// The API the pages call, answered from fixtures. Anything unlisted gets
// the envelope's 404, which is what the real API says too.
async function stubApi(page: Page) {
  await page.route("**/api/**", async (route) => {
    const { pathname } = new URL(route.request().url());
    const json = (status: number, body: unknown) =>
      route.fulfill({ status, json: body });

    if (pathname === "/api/projects") {
      return json(200, { success: true, data: projectList });
    }
    const slug = pathname.match(/^\/api\/projects\/([^/]+)$/)?.[1];
    const project = slug ? projectsBySlug[decodeURIComponent(slug)] : undefined;
    if (project) return json(200, { success: true, data: project });
    if (pathname.startsWith("/api/analytics/")) {
      return route.fulfill({ status: 204 });
    }
    if (pathname === "/api/auth/me") {
      return json(401, { success: false, error: "Not signed in" });
    }
    return json(404, { success: false, error: "Not found" });
  });
}

// Each page, with something on it that only renders once its data has, so
// the scan never runs against a loading state.
const PAGES = [
  { name: "home", path: "/", ready: "text=Food Forward" },
  {
    name: "permalink",
    path: "/projects/food-forward",
    ready: "h1:has-text('Food Forward')",
  },
  { name: "not found", path: "/no-such-page", ready: "h1" },
  // The game is a lazy chunk; its heading appears only once it has loaded.
  { name: "game", path: "/play", ready: "h1.game-heading" },
] as const;

// Prerendered pages start dark and switch after hydration, so each theme
// is its own set of colours to check. index.html's theme script reads this
// key before React does.
for (const theme of ["dark", "light"] as const) {
  for (const { name, path, ready } of PAGES) {
    test(`${name} (${theme}) has no WCAG AA violations`, async ({ page }) => {
      await page.addInitScript((value) => {
        localStorage.setItem("portfolio-theme", value);
      }, theme);
      await stubApi(page);
      await page.goto(path);
      await page.locator(ready).first().waitFor();
      await expectNoViolations(page);
    });
  }
}

// The resume is always light (index.html), so it has one variant.
test("resume has no WCAG AA violations", async ({ page }) => {
  await stubApi(page);
  await page.goto("/resume");
  await page.locator("h1").first().waitFor();
  await expectNoViolations(page);
});

async function expectNoViolations(page: Page) {
  const { violations } = await new AxeBuilder({ page })
    .withTags(WCAG_AA)
    .analyze();
  // One readable line per failing element, rather than axe's whole object,
  // so the CI log says what to fix and where.
  const found = violations.flatMap((v) =>
    v.nodes.map(
      (node) => `${v.id} (${v.impact}): ${node.target.join(" ")} - ${v.help}`
    )
  );
  expect(found).toEqual([]);
}
