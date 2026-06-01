import api from "./client";
import type {
  AnalyticsSummary,
  EngagementSummary,
  ProjectEngagement,
} from "../../../shared/contracts";

export type { AnalyticsSummary, EngagementSummary, ProjectEngagement };

// Admin-only analytics endpoints. The public POST endpoints
// (/api/analytics/pageview, /api/analytics/event) live in the analytics
// module and use their own adapter; these are admin reads via the shared
// API client.

export function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  return api.get<AnalyticsSummary>("/api/analytics/summary");
}

export function getEngagementSummary(): Promise<EngagementSummary> {
  return api.get<EngagementSummary>("/api/analytics/engagement");
}
