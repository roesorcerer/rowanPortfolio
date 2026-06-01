import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createProject,
  deleteProject,
  getProjects,
  updateProject,
  type ProjectPayload,
} from "../api/projects";

const PROJECTS_KEY = ["projects"] as const;

// Read hook. Components call useProjects() and get { data, isLoading, ... }.
// React Query handles caching, deduplication, and background refetching.
export function useProjects() {
  return useQuery({
    queryKey: PROJECTS_KEY,
    queryFn: getProjects,
  });
}

// Mutations — each one invalidates the projects query on success so any
// list rendering refreshes automatically. Callers don't need to call
// refetch() manually.

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProjectPayload) => createProject(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: PROJECTS_KEY }),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProjectPayload }) =>
      updateProject(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: PROJECTS_KEY }),
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: PROJECTS_KEY }),
  });
}
