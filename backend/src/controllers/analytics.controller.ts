import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types";
import { PageViewModel } from "../models/page-view.model";
import { EventModel } from "../models/event.model";
import { LIMITS } from "../validators/limits";
import { TrackEventInput } from "../validators/analytics.validators";

// POST /api/analytics/pageview  (public — called by the frontend on each route change)
export async function trackPageView(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const path: string = (req.body?.path ?? "/").slice(0, LIMITS.tracking.pathMax);
    const referrer: string = (req.body?.referrer ?? req.headers.referer ?? "").slice(
      0,
      LIMITS.tracking.referrerMax
    );
    const userAgent: string = (req.headers["user-agent"] ?? "").slice(
      0,
      LIMITS.tracking.userAgentMax
    );

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

// POST /api/analytics/event  (public — fired by the frontend for named interactions)
// Body validated by trackEventSchema middleware; headers are still defensively
// truncated because they come from the client without going through Zod.
export async function trackEvent(
  req: Request<unknown, unknown, TrackEventInput>,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const { eventType, projectId, projectTitle, projectType, linkType } = req.body;
    const referrer = (req.body.referrer ?? req.headers.referer ?? "").slice(
      0,
      LIMITS.tracking.referrerMax
    );
    const userAgent = (req.headers["user-agent"] ?? "").slice(0, LIMITS.tracking.userAgentMax);

    await EventModel.create({
      eventType,
      projectId: projectId ?? "",
      projectTitle: projectTitle ?? "",
      projectType: projectType ?? "",
      linkType: linkType ?? "",
      referrer,
      userAgent,
    });

    res.status(204).end();
  } catch (error) {
    next(error);
  }
}
