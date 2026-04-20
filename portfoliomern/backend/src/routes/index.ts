import { Router } from "express";
import healthRoutes from "./health.routes";
import projectRoutes from "./project.routes";
import authRoutes from "./auth.routes";
import contactRoutes from "./contact.routes";

const router = Router();

// All routes are prefixed with /api in app.ts
router.use("/health", healthRoutes);    // GET /api/health
router.use("/auth", authRoutes);        // POST /api/auth/register, POST /api/auth/login, GET /api/auth/me
router.use("/projects", projectRoutes); // GET /api/projects, GET /api/projects/:id, POST/PUT/DELETE (auth required)
router.use("/contact", contactRoutes);  // POST /api/contact

export default router;
