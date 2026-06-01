import api from "./client";

// Admin-only analytics endpoints. The public POST endpoints
// (/api/analytics/pageview, /api/analytics/event) live in the analytics
// module and use their own adapter; these are admin reads via the shared
// API client.

export interface AnalyticsSummary {
  totalViews: number;
  todayViews: number;
  last7DaysViews: number;
  byPath: { path: string; count: number }[];
  byDay: { date: string; count: number }[];
  byReferrer: { source: string; count: number }[];
  deviceBreakdown: { mobile: number; desktop: number };
  recentVisits: {
    path: string;
    source: string;
    device: string;
    createdAt: string;
  }[];
  byHour: { hour: number; count: number }[];
}

export interface ProjectEngagement {
  projectId: string;
  projectTitle: string;
  projectType: string;
  views: number;
  demoClicks: number;
  githubClicks: number;
}

export interface EngagementSummary {
  projectEngagement: ProjectEngagement[];
  conversionRate: number;
  totalMessages: number;
  totalPageViews: number;
}

export function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  return api.get<AnalyticsSummary>("/api/analytics/summary");
}

export function getEngagementSummary(): Promise<EngagementSummary> {
  return api.get<EngagementSummary>("/api/analytics/engagement");
}
