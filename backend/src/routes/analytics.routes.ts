import { Router } from "express";
import { trackPageView, getAnalyticsSummary, trackEvent, getEngagementSummary } from "../controllers/analytics.controller";
import { requireAuth, requireAdmin } from "../middleware/requireAuth";

const router = Router();

// Public — frontend fires these on every route change / interaction.
router.post("/pageview", trackPageView);
router.post("/event", trackEvent);

// Admin only — dashboard summaries.
router.get("/summary", requireAuth, requireAdmin, getAnalyticsSummary);
router.get("/engagement", requireAuth, requireAdmin, getEngagementSummary);

export default router;
