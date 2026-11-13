import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types";
import { PageViewModel } from "../models/page-view.model";
import { EventModel } from "../models/event.model";
import { LIMITS } from "../validators/limits";
import { isAutomatedAgent } from "../utils/automated-agent";
import {
  TrackEventInput,
  TrackPageViewInput,
} from "../validators/analytics.validators";

// POST /api/analytics/pageview  (public — called by the frontend on each route change)
// Body validated (and clipped) by trackPageViewSchema; the headers are
// clipped here because they never go through Zod.
export async function trackPageView(
  req: Request<unknown, unknown, TrackPageViewInput>,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const { path } = req.body;
    const referrer = (req.body.referrer ?? req.headers.referer ?? "").slice(
      0,
      LIMITS.tracking.referrerMax
    );
    const userAgent = (req.headers["user-agent"] ?? "").slice(
      0,
      LIMITS.tracking.userAgentMax
    );

    // Ignore admin routes and software (preview checks, crawlers) — we only
    // want visitor traffic. Still a 204: there's nothing for either to fix.
    if (path.startsWith("/admin") || isAutomatedAgent(userAgent)) {
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
    const { eventType, projectId, projectTitle, projectType, linkType } =
      req.body;
    const referrer = (req.body.referrer ?? req.headers.referer ?? "").slice(
      0,
      LIMITS.tracking.referrerMax
    );
    const userAgent = (req.headers["user-agent"] ?? "").slice(
      0,
      LIMITS.tracking.userAgentMax
    );

    if (isAutomatedAgent(userAgent)) {
      res.status(204).end();
      return;
    }

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
