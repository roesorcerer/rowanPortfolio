// Fire-and-forget event tracker. Never throws or blocks rendering.
export function trackEvent(payload: {
  eventType: "project_view" | "link_click";
  projectId?: string;
  projectTitle?: string;
  projectType?: string;
  linkType?: "demo" | "github";
}): void {
  fetch("/api/analytics/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      referrer: document.referrer,
    }),
  }).catch(() => undefined);
}
