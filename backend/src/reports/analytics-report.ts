import { PageViewModel } from "../models/page-view.model";
import { EventModel } from "../models/event.model";
import { ContactSubmissionModel } from "../models/contact-submission.model";
import type {
  AnalyticsSummary,
  EngagementSummary,
} from "../../../shared/contracts";

// Internal DTO names kept as aliases so existing imports continue to work.
// recentVisits[].createdAt is a Date at this layer; Express serializes it
// to an ISO string when the response is sent, which matches the wire
// shape declared in /shared/contracts.d.ts.
export type SummaryDTO = Omit<AnalyticsSummary, "recentVisits"> & {
  recentVisits: Array<{
    path: string;
    source: string;
    device: "mobile" | "desktop";
    createdAt: Date;
  }>;
};

export type EngagementDTO = EngagementSummary;

const DEVICE_REGEX_SOURCE = "mobile|android|iphone|ipad|tablet";
const DEVICE_REGEX = new RegExp(DEVICE_REGEX_SOURCE, "i");

function classifyDevice(userAgent: string): "mobile" | "desktop" {
  return DEVICE_REGEX.test(userAgent) ? "mobile" : "desktop";
}

function labelReferrer(url: string): string {
  if (!url) return "Direct";
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host.includes("linkedin")) return "LinkedIn";
    if (host.includes("github")) return "GitHub";
    if (host.includes("google")) return "Google";
    if (host.includes("bing")) return "Bing";
    if (host.includes("duckduckgo")) return "DuckDuckGo";
    if (host.includes("twitter") || host.includes("t.co") || host.includes("x.com"))
      return "Twitter / X";
    if (host.includes("reddit")) return "Reddit";
    if (host.includes("dev.to")) return "dev.to";
    if (host.includes("hashnode")) return "Hashnode";
    if (host.includes("producthunt")) return "Product Hunt";
    if (host.includes("hackernews") || host.includes("news.ycombinator")) return "Hacker News";
    return host || "Unknown";
  } catch {
    return "Unknown";
  }
}

function resolveWindows(now: Date): {
  todayStart: Date;
  sevenDaysAgo: Date;
  thirtyDaysAgo: Date;
} {
  const dayMs = 24 * 60 * 60 * 1000;
  return {
    todayStart: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
    sevenDaysAgo: new Date(now.getTime() - 7 * dayMs),
    thirtyDaysAgo: new Date(now.getTime() - 30 * dayMs),
  };
}

export async function summary(now: Date = new Date()): Promise<SummaryDTO> {
  const { todayStart, sevenDaysAgo, thirtyDaysAgo } = resolveWindows(now);

  const [
    totalViews,
    todayViews,
    last7DaysViews,
    byPath,
    byDay,
    byReferrerRaw,
    deviceAgg,
    recentVisitsRaw,
    byHour,
  ] = await Promise.all([
    PageViewModel.countDocuments(),
    PageViewModel.countDocuments({ createdAt: { $gte: todayStart } }),
    PageViewModel.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),

    PageViewModel.aggregate([
      { $group: { _id: "$path", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { path: "$_id", count: 1, _id: 0 } },
    ]),

    PageViewModel.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { date: "$_id", count: 1, _id: 0 } },
    ]),

    PageViewModel.aggregate([
      { $group: { _id: "$referrer", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 50 },
    ]),

    PageViewModel.aggregate([
      {
        $group: {
          _id: {
            $cond: {
              if: {
                $regexMatch: {
                  input: { $ifNull: ["$userAgent", ""] },
                  regex: DEVICE_REGEX_SOURCE,
                  options: "i",
                },
              },
              then: "mobile",
              else: "desktop",
            },
          },
          count: { $sum: 1 },
        },
      },
    ]),

    PageViewModel.find()
      .sort({ createdAt: -1 })
      .limit(15)
      .select("path referrer userAgent createdAt")
      .lean(),

    PageViewModel.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $hour: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { hour: "$_id", count: 1, _id: 0 } },
    ]),
  ]);

  const referrerMap = new Map<string, number>();
  for (const r of byReferrerRaw) {
    const label = labelReferrer(r._id ?? "");
    referrerMap.set(label, (referrerMap.get(label) ?? 0) + (r.count as number));
  }
  const byReferrer = Array.from(referrerMap.entries())
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const recentVisits = recentVisitsRaw.map((v) => ({
    path: v.path as string,
    source: labelReferrer((v.referrer as string) ?? ""),
    device: classifyDevice((v.userAgent as string) ?? ""),
    createdAt: v.createdAt as Date,
  }));

  return {
    totalViews,
    todayViews,
    last7DaysViews,
    byPath,
    byDay,
    byReferrer,
    deviceBreakdown: {
      mobile: (deviceAgg.find((d) => d._id === "mobile")?.count as number) ?? 0,
      desktop: (deviceAgg.find((d) => d._id === "desktop")?.count as number) ?? 0,
    },
    recentVisits,
    byHour,
  };
}

export async function engagement(): Promise<EngagementDTO> {
  const [projectViews, linkClicks, totalPageViews, totalMessages] = await Promise.all([
    EventModel.aggregate([
      { $match: { eventType: "project_view" } },
      {
        $group: {
          _id: {
            projectId: "$projectId",
            projectTitle: "$projectTitle",
            projectType: "$projectType",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 20 },
      {
        $project: {
          projectId: "$_id.projectId",
          projectTitle: "$_id.projectTitle",
          projectType: "$_id.projectType",
          count: 1,
          _id: 0,
        },
      },
    ]),

    EventModel.aggregate([
      { $match: { eventType: "link_click" } },
      {
        $group: {
          _id: {
            projectId: "$projectId",
            projectTitle: "$projectTitle",
            linkType: "$linkType",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      {
        $project: {
          projectId: "$_id.projectId",
          projectTitle: "$_id.projectTitle",
          linkType: "$_id.linkType",
          count: 1,
          _id: 0,
        },
      },
    ]),

    PageViewModel.countDocuments(),
    ContactSubmissionModel.countDocuments(),
  ]);

  const linkMap = new Map<string, { demo: number; github: number }>();
  for (const lc of linkClicks) {
    const entry = linkMap.get(lc.projectId) ?? { demo: 0, github: 0 };
    if (lc.linkType === "demo") entry.demo += lc.count;
    if (lc.linkType === "github") entry.github += lc.count;
    linkMap.set(lc.projectId, entry);
  }

  const projectEngagement = projectViews.map((pv) => ({
    projectId: pv.projectId,
    projectTitle: pv.projectTitle,
    projectType: pv.projectType,
    views: pv.count,
    demoClicks: linkMap.get(pv.projectId)?.demo ?? 0,
    githubClicks: linkMap.get(pv.projectId)?.github ?? 0,
  }));

  const conversionRate =
    totalPageViews > 0 ? Math.round((totalMessages / totalPageViews) * 100 * 10) / 10 : 0;

  return {
    projectEngagement,
    conversionRate,
    totalMessages,
    totalPageViews,
  };
}
