import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAdminAnalytics } from "./useAdminAnalytics";
import * as analyticsApi from "../api/analytics";

function wrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  function Wrap({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  }
  return { qc, Wrap };
}

const emptySummary = {
  totalViews: 0,
  todayViews: 0,
  last7DaysViews: 0,
  byPath: [],
  byDay: [],
  byReferrer: [],
  deviceBreakdown: { mobile: 0, desktop: 0 },
  recentVisits: [],
  byHour: [],
};

const emptyEngagement = {
  projectEngagement: [],
  conversionRate: 0,
  totalMessages: 0,
  totalPageViews: 0,
};

describe("useAdminAnalytics", () => {
  it("bundles summary and engagement into a single isLoading flag", async () => {
    vi.spyOn(analyticsApi, "getAnalyticsSummary").mockResolvedValue(emptySummary);
    vi.spyOn(analyticsApi, "getEngagementSummary").mockResolvedValue(
      emptyEngagement
    );
    const { Wrap } = wrapper();
    const { result } = renderHook(() => useAdminAnalytics(), { wrapper: Wrap });

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.summary).toEqual(emptySummary);
    expect(result.current.engagement).toEqual(emptyEngagement);
  });

  it("surfaces isError when either request fails", async () => {
    vi.spyOn(analyticsApi, "getAnalyticsSummary").mockResolvedValue(emptySummary);
    vi.spyOn(analyticsApi, "getEngagementSummary").mockRejectedValue(
      new Error("boom")
    );
    const { Wrap } = wrapper();
    const { result } = renderHook(() => useAdminAnalytics(), { wrapper: Wrap });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
