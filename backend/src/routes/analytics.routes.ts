import { Router } from "express";
import { trackPageView, trackEvent } from "../controllers/analytics.controller";
import { requireAuth } from "../middleware/requireAuth";
import { validate } from "../middleware/validate";
import { trackEventSchema } from "../validators/analytics.validators";
import { respond } from "./respond";
import * as analyticsReport from "../reports/analytics-report";

const router = Router();

// Public — frontend fires these on every route change / interaction.
router.post("/pageview", trackPageView);
router.post("/event", validate(trackEventSchema), trackEvent);

// Admin only — dashboard summaries.
router.get(
  "/summary",
  requireAuth,
  respond(() => analyticsReport.summary())
);
router.get(
  "/engagement",
  requireAuth,
  respond(() => analyticsReport.engagement())
);

export default router;
