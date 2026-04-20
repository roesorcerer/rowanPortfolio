import { Router } from "express";
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from "../controllers/project.controller";
import { requireAuth, requireAdmin } from "../middleware/requireAuth";
import { validate } from "../middleware/validate";
import {
  createProjectSchema,
  updateProjectSchema,
} from "../validators/project.validators";

const router = Router();

// Public — anyone can read projects (this is a portfolio site)
router.get("/", getProjects);
router.get("/:id", getProjectById);

// Protected — only admins can modify projects.
// Middleware chain: requireAuth (verify JWT) → requireAdmin (check role) → validate (check body) → controller
router.post("/", requireAuth, requireAdmin, validate(createProjectSchema), createProject);
router.put("/:id", requireAuth, requireAdmin, validate(updateProjectSchema), updateProject);
router.delete("/:id", requireAuth, requireAdmin, deleteProject);

export default router;
