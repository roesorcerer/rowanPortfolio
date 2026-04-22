import { Router } from "express";
import { trackPageView, getAnalyticsSummary } from "../controllers/analytics.controller";
import { requireAuth, requireAdmin } from "../middleware/requireAuth";

const router = Router();

// Public — frontend fires this on every route change.
router.post("/pageview", trackPageView);

// Admin only — dashboard summary.
router.get("/summary", requireAuth, requireAdmin, getAnalyticsSummary);

export default router;
