import api from "./client";
import type { Project, ProjectPayload } from "../../../shared/contracts";

export type { ProjectPayload };

// Each function maps 1:1 to a backend endpoint.
// The deepened client unwraps the {success, data} envelope and throws
// ApiError on failure, so these are one-liners.

export function getProjects(): Promise<Project[]> {
  return api.get<Project[]>("/api/projects");
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
