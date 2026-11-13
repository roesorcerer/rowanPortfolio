import { Router } from "express";
import {
  getProjectByIdOrSlug,
  getProjectForAdmin,
  updateProject,
  deleteProject,
} from "../controllers/project.controller";
import { requireAuth } from "../middleware/requireAuth";
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

// Admin read — the same list plus drafts. Declared before "/:idOrSlug" so
// "all" isn't swallowed as an id.
router.get("/all", requireAuth, respond(() => projectsStore.listAll()));

// Admin single-project read — drafts included, for previewing an unpublished
// case study at its permalink.
router.get("/all/:idOrSlug", requireAuth, getProjectForAdmin);

// Public permalink. Accepts either the slug a resume prints or a raw id.
router.get("/:idOrSlug", getProjectByIdOrSlug);

// Protected — only admins can modify projects.
router.post(
  "/",
  requireAuth,
  validate(createProjectSchema),
  respond((req) => projectsStore.create(req.body as CreateProjectInput), 201)
);

// Rewrites one display group's indices in a single call — also declared
// before "/:id" so "reorder" isn't read as an id.
router.put(
  "/reorder",
  requireAuth,
  validate(reorderProjectsSchema),
  respond(async (req) => ({
    reordered: await projectsStore.reorder((req.body as ReorderProjectsInput).ids),
  }))
);

router.put("/:id", requireAuth, validate(updateProjectSchema), updateProject);
router.delete("/:id", requireAuth, deleteProject);

export default router;
