import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types";
import { PageViewModel } from "../models/page-view.model";
import { EventModel } from "../models/event.model";

// POST /api/analytics/pageview  (public — called by the frontend on each route change)
export async function trackPageView(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const path: string = req.body?.path ?? "/";
    const referrer: string = req.body?.referrer ?? req.headers.referer ?? "";
    const userAgent: string = req.headers["user-agent"] ?? "";

    // Ignore admin routes — we only want visitor traffic.
    if (path.startsWith("/admin")) {
      res.status(204).end();
      return;
    }

    await PageViewModel.create({ path, referrer, userAgent });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

// Maps a raw referrer URL to a human-readable traffic source label.
function parseReferrerSource(url: string): string {
  if (!url) return "Direct";
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host.includes("linkedin")) return "LinkedIn";
    if (host.includes("github")) return "GitHub";
    if (host.includes("google")) return "Google";
    if (host.includes("bing")) return "Bing";
    if (host.includes("duckduckgo")) return "DuckDuckGo";
    if (host.includes("twitter") || host.includes("t.co") || host.includes("x.com")) return "Twitter / X";
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

// GET /api/analytics/summary  (admin only)
// Returns aggregated stats for the portfolio admin dashboard.
export async function getAnalyticsSummary(
  _req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalViews,
      todayViews,
      last7DaysViews,
      byPath,
      byDay,
      byReferrerRaw,
      deviceBreakdown,
      recentVisitsRaw,
      byHour,
    ] = await Promise.all([
      // All-time total
      PageViewModel.countDocuments(),

      // Views today
      PageViewModel.countDocuments({ createdAt: { $gte: todayStart } }),

      // Views last 7 days
      PageViewModel.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),

      // Top pages (all-time)
      PageViewModel.aggregate([
        { $group: { _id: "$path", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { path: "$_id", count: 1, _id: 0 } },
      ]),

      // Daily views for the last 30 days
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

      // Raw referrer strings (group before parsing to keep aggregation fast)
      PageViewModel.aggregate([
        { $group: { _id: "$referrer", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 50 },
      ]),

      // Device type breakdown (mobile vs desktop via userAgent heuristic)
      PageViewModel.aggregate([
        {
          $group: {
            _id: {
              $cond: {
                if: {
                  $regexMatch: {
                    input: { $ifNull: ["$userAgent", ""] },
                    regex: "mobile|android|iphone|ipad|tablet",
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

      // 15 most recent visits for the activity feed
      PageViewModel.find()
        .sort({ createdAt: -1 })
        .limit(15)
        .select("path referrer userAgent createdAt")
        .lean(),

      // Hourly activity pattern for the last 7 days (reveals recruiter browsing hours)
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

    // Merge raw referrers into labelled sources
    const referrerMap = new Map<string, number>();
    for (const r of byReferrerRaw) {
      const label = parseReferrerSource(r._id ?? "");
      referrerMap.set(label, (referrerMap.get(label) ?? 0) + (r.count as number));
    }
    const byReferrer = Array.from(referrerMap.entries())
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Parse device + referrer for the recent-visits feed
    const recentVisits = recentVisitsRaw.map((v) => ({
      path: v.path as string,
      source: parseReferrerSource((v.referrer as string) ?? ""),
      device: /mobile|android|iphone|ipad|tablet/i.test((v.userAgent as string) ?? "")
        ? "mobile"
        : "desktop",
      createdAt: v.createdAt,
    }));

    res.json({
      success: true,
      data: {
        totalViews,
        todayViews,
        last7DaysViews,
        byPath,
        byDay,
        byReferrer,
        deviceBreakdown: {
          mobile: (deviceBreakdown.find((d) => d._id === "mobile")?.count as number) ?? 0,
          desktop: (deviceBreakdown.find((d) => d._id === "desktop")?.count as number) ?? 0,
        },
        recentVisits,
        byHour,
      },
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/analytics/event  (public — fired by the frontend for named interactions)
export async function trackEvent(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const { eventType, projectId, projectTitle, projectType, linkType } = req.body ?? {};
    const referrer: string = req.body?.referrer ?? req.headers.referer ?? "";
    const userAgent: string = req.headers["user-agent"] ?? "";

    if (!eventType || typeof eventType !== "string") {
      res.status(400).json({ success: false, error: "eventType is required" });
      return;
    }

    await EventModel.create({
      eventType: String(eventType).slice(0, 64),
      projectId: projectId ? String(projectId).slice(0, 64) : "",
      projectTitle: projectTitle ? String(projectTitle).slice(0, 256) : "",
      projectType: projectType ? String(projectType).slice(0, 32) : "",
      linkType: linkType ? String(linkType).slice(0, 32) : "",
      referrer: String(referrer).slice(0, 512),
      userAgent: String(userAgent).slice(0, 512),
    });

    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

// GET /api/analytics/engagement  (admin only)
// Returns project-level engagement: modal opens + link clicks, ranked.
export async function getEngagementSummary(
  _req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const [projectViews, linkClicks, totalPageViews, totalMessages] = await Promise.all([
      // How many times each project modal was opened
      EventModel.aggregate([
        { $match: { eventType: "project_view" } },
        {
          $group: {
            _id: { projectId: "$projectId", projectTitle: "$projectTitle", projectType: "$projectType" },
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

      // How many times demo / github links were clicked per project
      EventModel.aggregate([
        { $match: { eventType: "link_click" } },
        {
          $group: {
            _id: { projectId: "$projectId", projectTitle: "$projectTitle", linkType: "$linkType" },
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
      // Reuse contact submissions count as a proxy for conversions
      // (import inline to avoid circular deps)
      (await import("../models/contact-submission.model")).ContactSubmissionModel.countDocuments(),
    ]);

    // Merge link clicks into a map keyed by projectId for easy lookup
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

    res.json({
      success: true,
      data: {
        projectEngagement,
        conversionRate,
        totalMessages,
        totalPageViews,
      },
    });
  } catch (error) {
    next(error);
  }
}
