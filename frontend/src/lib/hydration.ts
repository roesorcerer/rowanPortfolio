// Whether the page is hydrating prerendered HTML, for the few components
// whose first render would otherwise read browser-only state (the theme,
// from localStorage). main.tsx sets it before hydrateRoot; it's false for a
// page rendered only in the browser, and on the server nothing sets it.
//
// A component that reads it must render what the server rendered while it
// is true, then catch up in a transition after mount. A plain update during
// hydration reaches a Suspense boundary that hasn't finished hydrating, and
// React gives up on the server HTML inside it (error #421).
let hydrating = false;

export function beginHydration(): void {
  hydrating = true;
}

/**
 * Read once, at a component's first render. The first component to finish
 * mounting after hydration clears it (endHydration), so a page navigated to
 * later renders with browser state from the start.
 */
export function isHydrating(): boolean {
  return hydrating;
}

export function endHydration(): void {
  hydrating = false;
}
