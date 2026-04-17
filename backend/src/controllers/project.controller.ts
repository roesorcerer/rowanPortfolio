import { Request, Response, NextFunction } from "express";
import { ProjectModel } from "../models/project.model";
import { ApiResponse } from "../types";
import {
  CreateProjectInput,
  UpdateProjectInput,
} from "../validators/project.validators";

// GET /api/projects
// Returns all projects, sorted by the 'order' field.
// The .lean() call returns plain JS objects instead of full Mongoose
// documents — faster and uses less memory when you only need to read.
export async function getProjects(
  _req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const projects = await ProjectModel.find().sort({ order: 1 }).lean();

    res.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/projects/:id
export async function getProjectById(
  req: Request<{ id: string }>,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const project = await ProjectModel.findById(req.params.id).lean();

    if (!project) {
      res.status(404).json({
        success: false,
        error: "Project not found",
      });
      return;
    }

    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    // Mongoose throws a CastError if the id isn't a valid ObjectId.
    // Catch it and return 404 instead of a 500 server error.
    if ((error as any).name === "CastError") {
      res.status(404).json({
        success: false,
        error: "Project not found",
      });
      return;
    }
    next(error);
  }
}

// POST /api/projects (auth required)
// Creates a new project. The request body is already validated by Zod.
export async function createProject(
  req: Request<unknown, unknown, CreateProjectInput>,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const project = await ProjectModel.create(req.body);

    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/projects/:id (auth required)
// Updates an existing project. Only the fields sent are updated.
export async function updateProject(
  req: Request<{ id: string }, unknown, UpdateProjectInput>,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    // { new: true } returns the updated document instead of the old one.
    // runValidators ensures Mongoose schema validations still apply.
    const project = await ProjectModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: "after", runValidators: true }
    ).lean();

    if (!project) {
      res.status(404).json({
        success: false,
        error: "Project not found",
      });
      return;
    }

    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    if ((error as any).name === "CastError") {
      res.status(404).json({
        success: false,
        error: "Project not found",
      });
      return;
    }
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
    const project = await ProjectModel.findByIdAndDelete(req.params.id);

    if (!project) {
      res.status(404).json({
        success: false,
        error: "Project not found",
      });
      return;
    }

    // 200 with a confirmation message, not 204 (no content),
    // so the client gets a consistent ApiResponse shape.
    res.json({
      success: true,
      data: { message: "Project deleted" },
    });
  } catch (error) {
    if ((error as any).name === "CastError") {
      res.status(404).json({
        success: false,
        error: "Project not found",
      });
      return;
    }
    next(error);
  }
}
