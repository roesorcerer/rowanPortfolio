import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Fires a pageview event to the backend whenever the route changes.
// Uses a fire-and-forget fetch so it never blocks rendering.
export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    // Don't track admin pages.
    if (location.pathname.startsWith("/admin")) return;

    fetch("/api/analytics/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: location.pathname,
        referrer: document.referrer,
      }),
      // Best-effort — ignore any errors silently.
    }).catch(() => undefined);
  }, [location.pathname]);
}
