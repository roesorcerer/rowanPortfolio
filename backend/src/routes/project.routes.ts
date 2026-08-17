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
  reorderProjectsSchema,
  CreateProjectInput,
  ReorderProjectsInput,
} from "../validators/project.validators";
import { respond } from "./respond";
import * as projectsStore from "../stores/projects-store";

const router = Router();

// Public — anyone can read published projects (this is a portfolio site).
router.get("/", respond(() => projectsStore.list()));

// Admin read — the same list plus drafts. Declared before "/:id" so "all"
// isn't swallowed as an id.
router.get("/all", requireAuth, requireAdmin, respond(() => projectsStore.listAll()));

router.get("/:id", getProjectById);

// Protected — only admins can modify projects.
router.post(
  "/",
  requireAuth,
  requireAdmin,
  validate(createProjectSchema),
  respond((req) => projectsStore.create(req.body as CreateProjectInput), 201)
);

// Rewrites one display group's indices in a single call — also declared
// before "/:id" so "reorder" isn't read as an id.
router.put(
  "/reorder",
  requireAuth,
  requireAdmin,
  validate(reorderProjectsSchema),
  respond(async (req) => ({
    reordered: await projectsStore.reorder((req.body as ReorderProjectsInput).ids),
  }))
);

router.put("/:id", requireAuth, requireAdmin, validate(updateProjectSchema), updateProject);
router.delete("/:id", requireAuth, requireAdmin, deleteProject);

export default router;
