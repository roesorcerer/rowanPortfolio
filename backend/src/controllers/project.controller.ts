import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types";
import { UpdateProjectInput } from "../validators/project.validators";
import * as projectsStore from "../stores/projects-store";

// GET /api/projects/:id
export async function getProjectById(
  req: Request<{ id: string }>,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const project = await projectsStore.findById(req.params.id);
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
