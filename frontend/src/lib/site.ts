// The site's canonical origin. Links that leave the page (a printed resume,
// a copied permalink, a canonical tag, a link preview) use this rather than
// window.location.origin, for two reasons: the address that circulates
// should be the real one even when copied from a preview deploy or
// localhost, and the prerender step has no window to read, so a page built
// from window.location would render a different link on the server than in
// the browser and fail to hydrate.
export const SITE_ORIGIN = "https://rowan.page";
