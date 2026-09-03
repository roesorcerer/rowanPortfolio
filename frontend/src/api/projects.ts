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

/**
 * Public permalink read — accepts the slug a resume prints or a raw id.
 * Drafts 404 here; use `getProjectForAdmin` to preview one.
 */
export function getProjectByIdOrSlug(idOrSlug: string): Promise<Project> {
  return api.get<Project>(`/api/projects/${encodeURIComponent(idOrSlug)}`);
}

/** The same lookup with drafts visible. Requires an admin session. */
export function getProjectForAdmin(idOrSlug: string): Promise<Project> {
  return api.get<Project>(`/api/projects/all/${encodeURIComponent(idOrSlug)}`);
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
