import { Router } from "express";
import { trackPageView, trackEvent } from "../controllers/analytics.controller";
import { requireAuth } from "../middleware/requireAuth";
import { validate } from "../middleware/validate";
import { intakeBody } from "../middleware/intakeBody";
import {
  trackEventSchema,
  trackPageViewSchema,
} from "../validators/analytics.validators";
import { respond } from "./respond";
import * as analyticsReport from "../reports/analytics-report";

const router = Router();

// Public — frontend fires these on every route change / interaction, as
// text/plain JSON so the cross-origin request needs no preflight (see
// intakeBody).
router.post(
  "/pageview",
  ...intakeBody,
  validate(trackPageViewSchema),
  trackPageView
);
router.post("/event", ...intakeBody, validate(trackEventSchema), trackEvent);

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
