import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types";
import { UpdateProjectInput } from "../validators/project.validators";
import * as projectsStore from "../stores/projects-store";

// GET /api/projects/:idOrSlug — the public case-study permalink.
//
// Drafts 404 here exactly as they're absent from the list: an unpublished
// project has no public URL, guessable or otherwise.
export async function getProjectByIdOrSlug(
  req: Request<{ idOrSlug: string }>,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const project = await projectsStore.findByIdOrSlug(req.params.idOrSlug);
    if (!project) {
      res.status(404).json({ success: false, error: "Project not found" });
      return;
    }
    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
}

// GET /api/projects/all/:idOrSlug (auth required) — the same lookup with
// drafts visible, so a case study can be proofread at its real URL before it
// goes live.
export async function getProjectForAdmin(
  req: Request<{ idOrSlug: string }>,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const project = await projectsStore.findByIdOrSlug(req.params.idOrSlug, {
      publishedOnly: false,
    });
    if (!project) {
      res.status(404).json({ success: false, error: "Project not found" });
      return;
    }
    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
}

// PUT /api/projects/:id (auth required)
export async function updateProject(
  req: Request<{ id: string }, unknown, UpdateProjectInput>,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const project = await projectsStore.update(req.params.id, req.body);
    if (!project) {
      res.status(404).json({ success: false, error: "Project not found" });
      return;
    }
    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/projects/:id (auth required)
export async function deleteProject(
  req: Request<{ id: string }>,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const deleted = await projectsStore.remove(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, error: "Project not found" });
      return;
    }
    res.json({ success: true, data: { message: "Project deleted" } });
  } catch (error) {
    next(error);
  }
}
