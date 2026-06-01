import { render, screen } from "@testing-library/react";
import DailyTrend from "./DailyTrend";
import TrafficSources from "./TrafficSources";
import RecentVisits from "./RecentVisits";

// Each analytics widget is a pure function of its props — no hooks,
// no provider wiring, no QueryClient. The tests prove that by rendering
// them with raw data.

describe("analytics widgets", () => {
  describe("DailyTrend", () => {
    it("shows the empty state when no days are provided", () => {
      render(<DailyTrend days={[]} />);
      expect(screen.getByText("No data yet.")).toBeInTheDocument();
    });

    it("renders one bar per day", () => {
      const { container } = render(
        <DailyTrend
          days={[
            { date: "2026-05-01", count: 3 },
            { date: "2026-05-02", count: 7 },
            { date: "2026-05-03", count: 1 },
          ]}
        />
      );
      // Each bar has a title attribute we can count on.
      const bars = container.querySelectorAll('[title*="view"]');
      expect(bars).toHaveLength(3);
    });
  });

  describe("TrafficSources", () => {
    it("shows the empty state when no referrers exist", () => {
      render(<TrafficSources byReferrer={[]} />);
      expect(screen.getByText("No referrer data yet.")).toBeInTheDocument();
    });

    it("renders each referrer with its percentage", () => {
      render(
        <TrafficSources
          byReferrer={[
            { source: "google.com", count: 75 },
            { source: "direct", count: 25 },
          ]}
        />
      );
      expect(screen.getByText("google.com")).toBeInTheDocument();
      expect(screen.getByText("75%")).toBeInTheDocument();
      expect(screen.getByText("direct")).toBeInTheDocument();
      expect(screen.getByText("25%")).toBeInTheDocument();
    });
  });

  describe("RecentVisits", () => {
    it("shows the empty state when no visits exist", () => {
      render(<RecentVisits visits={[]} />);
      expect(screen.getByText("No visits recorded yet.")).toBeInTheDocument();
    });
  });
});
