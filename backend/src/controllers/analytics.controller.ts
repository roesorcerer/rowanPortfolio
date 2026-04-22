import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types";
import { PageViewModel } from "../models/page-view.model";

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

// GET /api/analytics/summary  (admin only)
// Returns aggregated stats: total views, views by path, views over time (last 30 days).
export async function getAnalyticsSummary(
  _req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [totalViews, byPath, byDay] = await Promise.all([
      // Total all-time views
      PageViewModel.countDocuments(),

      // Top pages
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
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { date: "$_id", count: 1, _id: 0 } },
      ]),
    ]);

    res.json({
      success: true,
      data: { totalViews, byPath, byDay },
    });
  } catch (error) {
    next(error);
  }
}
