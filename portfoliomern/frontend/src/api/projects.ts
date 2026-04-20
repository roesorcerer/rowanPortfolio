import api from "./client";
import type { Project, ApiResponse } from "../types";

// Each function maps 1:1 to a backend endpoint.
// They return the parsed data, not the raw Axios response.

export async function getProjects(): Promise<Project[]> {
  const { data } = await api.get<ApiResponse<Project[]>>("/api/projects");
  return data.data!;
}

export async function getProjectById(id: string): Promise<Project> {
  const { data } = await api.get<ApiResponse<Project>>(`/api/projects/${id}`);
  return data.data!;
}
