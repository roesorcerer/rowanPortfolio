import { useQueries } from "@tanstack/react-query";
import {
  getAnalyticsSummary,
  getEngagementSummary,
  type AnalyticsSummary,
  type EngagementSummary,
} from "../api/analytics";

// Fetches both admin analytics endpoints in parallel. The dashboard renders
// nothing until both succeed, so callers get a single isLoading flag and
// either both payloads or both undefined.
export function useAdminAnalytics() {
  const [summary, engagement] = useQueries({
    queries: [
      {
        queryKey: ["admin", "analytics", "summary"] as const,
        queryFn: getAnalyticsSummary,
      },
      {
        queryKey: ["admin", "analytics", "engagement"] as const,
        queryFn: getEngagementSummary,
      },
    ],
  });

  return {
    summary: summary.data as AnalyticsSummary | undefined,
    engagement: engagement.data as EngagementSummary | undefined,
    isLoading: summary.isLoading || engagement.isLoading,
    isError: summary.isError || engagement.isError,
  };
}
