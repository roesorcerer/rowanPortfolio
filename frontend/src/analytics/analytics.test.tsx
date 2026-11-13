import { render, screen, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import {
  AnalyticsProvider,
  TestAnalyticsAdapter,
  useAnalytics,
  fetchAnalyticsAdapter,
} from "./index";
import type { Project } from "../types";

const project: Project = {
  _id: "p1",
  slug: "hello",
  title: "Hello",
  category: ["Web"],
  description: "",
  image: "/x.png",
  links: [],
  media: [],
  collaborators: [],
  details: [],
  order: 0,
  featured: false,
  projectType: "product",
  status: "published",
  createdAt: "",
  updatedAt: "",
};

function Probe({
  onMount,
}: {
  onMount: (a: ReturnType<typeof useAnalytics>) => void;
}) {
  const analytics = useAnalytics();
  onMount(analytics);
  return null;
}

function mount(
  adapter: TestAnalyticsAdapter,
  path: string,
  capture: (a: ReturnType<typeof useAnalytics>) => void
) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AnalyticsProvider adapter={adapter}>
        <Probe onMount={capture} />
      </AnalyticsProvider>
    </MemoryRouter>
  );
}

describe("analytics", () => {
  describe("AnalyticsProvider", () => {
    it("fires a pageview on initial mount with the current path", () => {
      const adapter = new TestAnalyticsAdapter();
      mount(adapter, "/", () => {});
      expect(adapter.events).toEqual([
        expect.objectContaining({ type: "pageview", path: "/" }),
      ]);
    });

    it("skips admin paths entirely", () => {
      const adapter = new TestAnalyticsAdapter();
      let captured!: ReturnType<typeof useAnalytics>;
      mount(adapter, "/admin", (a) => (captured = a));
      act(() => captured.projectView(project));
      act(() => captured.linkClick(project, "demo"));
      expect(adapter.events).toEqual([]);
    });

    it("attaches path and referrer to project_view", () => {
      const adapter = new TestAnalyticsAdapter();
      let captured!: ReturnType<typeof useAnalytics>;
      mount(adapter, "/resume", (a) => (captured = a));
      adapter.events.length = 0; // drop the initial pageview
      act(() => captured.projectView(project));
      expect(adapter.events).toEqual([
        {
          type: "project_view",
          path: "/resume",
          referrer: "",
          projectId: "p1",
          projectTitle: "Hello",
          projectType: "product",
        },
      ]);
    });

    it("attaches linkType and path to link_click", () => {
      const adapter = new TestAnalyticsAdapter();
      let captured!: ReturnType<typeof useAnalytics>;
      mount(adapter, "/", (a) => (captured = a));
      adapter.events.length = 0;
      act(() => captured.linkClick(project, "github"));
      expect(adapter.events).toEqual([
        expect.objectContaining({
          type: "link_click",
          path: "/",
          projectId: "p1",
          linkType: "github",
        }),
      ]);
    });
  });

  describe("useAnalytics outside a provider", () => {
    it("returns a no-op so component tests don't need to wrap", () => {
      // Just rendering without a provider must not throw.
      function Caller() {
        const analytics = useAnalytics();
        analytics.projectView(project);
        analytics.linkClick(project, "demo");
        analytics.pageview();
        return <div>ok</div>;
      }
      render(<Caller />);
      expect(screen.getByText("ok")).toBeInTheDocument();
    });
  });

  describe("fetchAnalyticsAdapter", () => {
    it("POSTs pageview to /api/analytics/pageview", () => {
      const fetchSpy = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(new Response(null, { status: 204 }));
      try {
        fetchAnalyticsAdapter.send({
          type: "pageview",
          path: "/",
          referrer: "",
        });
        expect(fetchSpy).toHaveBeenCalledWith(
          "/api/analytics/pageview",
          expect.objectContaining({ method: "POST" })
        );
      } finally {
        fetchSpy.mockRestore();
      }
    });

    it("POSTs project_view to /api/analytics/event with eventType in the body", () => {
      const fetchSpy = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(new Response(null, { status: 204 }));
      try {
        fetchAnalyticsAdapter.send({
          type: "project_view",
          path: "/",
          referrer: "",
          projectId: "p1",
          projectTitle: "Hello",
          projectType: "product",
        });
        const call = fetchSpy.mock.calls[0];
        expect(call[0]).toBe("/api/analytics/event");
        const body = JSON.parse((call[1] as RequestInit).body as string);
        expect(body).toMatchObject({
          eventType: "project_view",
          projectId: "p1",
          projectTitle: "Hello",
          projectType: "product",
          path: "/",
        });
      } finally {
        fetchSpy.mockRestore();
      }
    });

    // Production sets VITE_API_URL to the Fly hostname. Going through
    // rowan.page's /api rewrite instead would make every visitor look like
    // a Vercel server to the backend.
    it("posts to the API origin as text/plain, so no preflight is needed", () => {
      vi.stubEnv("VITE_API_URL", "https://api.example.test");
      const fetchSpy = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(new Response(null, { status: 204 }));
      try {
        fetchAnalyticsAdapter.send({
          type: "pageview",
          path: "/",
          referrer: "",
        });
        const [url, init] = fetchSpy.mock.calls[0];
        expect(url).toBe("https://api.example.test/api/analytics/pageview");
        expect((init as RequestInit).headers).toEqual({
          "Content-Type": "text/plain;charset=UTF-8",
        });
        expect(JSON.parse((init as RequestInit).body as string)).toEqual({
          path: "/",
          referrer: "",
        });
      } finally {
        fetchSpy.mockRestore();
        vi.unstubAllEnvs();
      }
    });

    it("sends link clicks by beacon to the API origin", () => {
      vi.stubEnv("VITE_API_URL", "https://api.example.test");
      const beacon = vi.fn().mockReturnValue(true);
      Object.defineProperty(navigator, "sendBeacon", {
        value: beacon,
        configurable: true,
      });
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      try {
        fetchAnalyticsAdapter.send({
          type: "link_click",
          path: "/",
          referrer: "",
          projectId: "p1",
          projectTitle: "Hello",
          linkType: "demo",
        });
        expect(beacon).toHaveBeenCalledWith(
          "https://api.example.test/api/analytics/event",
          expect.any(Blob)
        );
        expect((beacon.mock.calls[0][1] as Blob).type).toBe(
          "text/plain;charset=utf-8"
        );
        expect(fetchSpy).not.toHaveBeenCalled();
      } finally {
        fetchSpy.mockRestore();
        vi.unstubAllEnvs();
        // jsdom has no sendBeacon of its own; remove the stub.
        delete (navigator as { sendBeacon?: unknown }).sendBeacon;
      }
    });

    it("never throws when fetch rejects", async () => {
      const fetchSpy = vi
        .spyOn(globalThis, "fetch")
        .mockRejectedValue(new Error("network down"));
      try {
        expect(() =>
          fetchAnalyticsAdapter.send({
            type: "pageview",
            path: "/",
            referrer: "",
          })
        ).not.toThrow();
        // Let the rejected promise settle so vitest doesn't flag it.
        await Promise.resolve();
      } finally {
        fetchSpy.mockRestore();
      }
    });
  });
});
