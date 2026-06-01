import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { useLocation } from "react-router-dom";
import type { Project } from "../types";

// ---- Wire shape ----------------------------------------------------------

export type AnalyticsEvent =
  | {
      type: "pageview";
      path: string;
      referrer: string;
    }
  | {
      type: "project_view";
      path: string;
      referrer: string;
      projectId: string;
      projectTitle: string;
      projectType: string;
    }
  | {
      type: "link_click";
      path: string;
      referrer: string;
      projectId: string;
      projectTitle: string;
      linkType: "demo" | "github";
    };

// ---- Adapter seam --------------------------------------------------------

export interface AnalyticsAdapter {
  send(event: AnalyticsEvent): void;
}

// Production adapter: posts to /api/analytics/*. Never throws.
// Uses sendBeacon for link_click so the request survives the page unload
// when the user follows the link.
export const fetchAnalyticsAdapter: AnalyticsAdapter = {
  send(event) {
    const [url, body] = serialize(event);
    if (event.type === "link_click" && supportsBeacon()) {
      try {
        const blob = new Blob([body], { type: "application/json" });
        if (navigator.sendBeacon(url, blob)) return;
      } catch {
        // fall through to fetch
      }
    }
    void fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => undefined);
  },
};

// Test adapter: collects events for assertion.
export class TestAnalyticsAdapter implements AnalyticsAdapter {
  events: AnalyticsEvent[] = [];
  send(event: AnalyticsEvent): void {
    this.events.push(event);
  }
}

function serialize(event: AnalyticsEvent): [string, string] {
  if (event.type === "pageview") {
    return [
      "/api/analytics/pageview",
      JSON.stringify({ path: event.path, referrer: event.referrer }),
    ];
  }
  const { type, ...rest } = event;
  return [
    "/api/analytics/event",
    JSON.stringify({ eventType: type, ...rest }),
  ];
}

function supportsBeacon(): boolean {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.sendBeacon === "function"
  );
}

// ---- Public hook surface -------------------------------------------------

export interface Analytics {
  projectView(project: Project): void;
  linkClick(project: Project, linkType: "demo" | "github"): void;
  pageview(): void;
}

// Default value when no provider is mounted (e.g. component tests that don't
// care about analytics). Silently does nothing.
const NOOP_ANALYTICS: Analytics = {
  projectView() {},
  linkClick() {},
  pageview() {},
};

const AnalyticsContext = createContext<Analytics>(NOOP_ANALYTICS);

export function useAnalytics(): Analytics {
  return useContext(AnalyticsContext);
}

// Admin paths are never tracked — admin sessions would skew the metrics.
function isTrackable(path: string): boolean {
  return !path.startsWith("/admin");
}

interface AnalyticsProviderProps {
  adapter: AnalyticsAdapter;
  children: ReactNode;
}

export function AnalyticsProvider({
  adapter,
  children,
}: AnalyticsProviderProps) {
  const location = useLocation();

  // Keep the current path readable from inside the memoized verbs without
  // rebuilding them on every navigation.
  const pathRef = useRef(location.pathname);
  pathRef.current = location.pathname;

  const analytics = useMemo<Analytics>(() => {
    const ambient = () => ({
      path: pathRef.current,
      referrer: typeof document !== "undefined" ? document.referrer : "",
    });
    return {
      pageview() {
        if (!isTrackable(pathRef.current)) return;
        adapter.send({ type: "pageview", ...ambient() });
      },
      projectView(project) {
        if (!isTrackable(pathRef.current)) return;
        adapter.send({
          type: "project_view",
          ...ambient(),
          projectId: project._id,
          projectTitle: project.title,
          projectType: project.projectType,
        });
      },
      linkClick(project, linkType) {
        if (!isTrackable(pathRef.current)) return;
        adapter.send({
          type: "link_click",
          ...ambient(),
          projectId: project._id,
          projectTitle: project.title,
          linkType,
        });
      },
    };
  }, [adapter]);

  // Auto-fire pageview on every route change (and on initial mount).
  useEffect(() => {
    analytics.pageview();
  }, [location.pathname, analytics]);

  return (
    <AnalyticsContext.Provider value={analytics}>
      {children}
    </AnalyticsContext.Provider>
  );
}
