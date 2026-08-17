import api from "./client";
import type { Project, ProjectPayload } from "../../../shared/contracts";

export type { ProjectPayload };

// Each function maps 1:1 to a backend endpoint.
// The deepened client unwraps the {success, data} envelope and throws
// ApiError on failure, so these are one-liners.

/** Public list — published projects only. */
export function getProjects(): Promise<Project[]> {
  return api.get<Project[]>("/api/projects");
}

/** Admin list — the same projects plus drafts. Requires an admin session. */
export function getAllProjects(): Promise<Project[]> {
  return api.get<Project[]>("/api/projects/all");
}

/**
 * Rewrites one display group's indices in a single call — position in `ids`
 * becomes the new order.
 */
export function reorderProjects(ids: string[]): Promise<{ reordered: number }> {
  return api.put<{ reordered: number }>("/api/projects/reorder", { ids });
}

export function getProjectById(id: string): Promise<Project> {
  return api.get<Project>(`/api/projects/${id}`);
}

export function createProject(payload: ProjectPayload): Promise<Project> {
  return api.post<Project>("/api/projects", payload);
}

export function updateProject(
  id: string,
  payload: ProjectPayload
): Promise<Project> {
  return api.put<Project>(`/api/projects/${id}`, payload);
}

export function deleteProject(id: string): Promise<void> {
  return api.delete(`/api/projects/${id}`);
}
