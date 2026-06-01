import { Router } from "express";
import {
  getProjectById,
  updateProject,
  deleteProject,
} from "../controllers/project.controller";
import { requireAuth, requireAdmin } from "../middleware/requireAuth";
import { validate } from "../middleware/validate";
import {
  createProjectSchema,
  updateProjectSchema,
  CreateProjectInput,
} from "../validators/project.validators";
import { respond } from "./respond";
import * as projectsStore from "../stores/projects-store";

const router = Router();

// Public — anyone can read projects (this is a portfolio site)
router.get("/", respond(() => projectsStore.list()));
router.get("/:id", getProjectById);

// Protected — only admins can modify projects.
router.post(
  "/",
  requireAuth,
  requireAdmin,
  validate(createProjectSchema),
  respond((req) => projectsStore.create(req.body as CreateProjectInput), 201)
);
router.put("/:id", requireAuth, requireAdmin, validate(updateProjectSchema), updateProject);
router.delete("/:id", requireAuth, requireAdmin, deleteProject);

export default router;
