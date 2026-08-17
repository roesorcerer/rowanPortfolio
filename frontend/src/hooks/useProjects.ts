import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createProject,
  deleteProject,
  getAllProjects,
  getProjects,
  reorderProjects,
  updateProject,
  type ProjectPayload,
} from "../api/projects";
import type { Project } from "../types";

const PROJECTS_KEY = ["projects"] as const;
const ADMIN_PROJECTS_KEY = ["projects", "admin"] as const;

// Read hooks. Components call useProjects() and get { data, isLoading, ... }.
// React Query handles caching, deduplication, and background refetching.

/** Public list — published projects only. */
export function useProjects() {
  return useQuery({
    queryKey: PROJECTS_KEY,
    queryFn: getProjects,
  });
}

/**
 * Admin list — includes drafts. Separate query key from useProjects() so the
 * public site never renders a draft out of a warm cache.
 */
export function useAllProjects() {
  return useQuery({
    queryKey: ADMIN_PROJECTS_KEY,
    queryFn: getAllProjects,
  });
}

// Mutations — each one invalidates both project queries on success so any
// list rendering refreshes automatically. Callers don't need to call
// refetch() manually.

function invalidateProjects(qc: ReturnType<typeof useQueryClient>) {
  // The admin key is a prefix match on ["projects"], so one call covers both.
  return qc.invalidateQueries({ queryKey: PROJECTS_KEY });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProjectPayload) => createProject(payload),
    onSuccess: () => invalidateProjects(qc),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProjectPayload }) =>
      updateProject(id, payload),
    onSuccess: () => invalidateProjects(qc),
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: () => invalidateProjects(qc),
  });
}

/**
 * Rewrites a display group's indices in one call. Applied optimistically —
 * a drop that snapped back to the old position while the request flew would
 * read as a bug, so the cache moves first and rolls back only on failure.
 */
export function useReorderProjects() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => reorderProjects(ids),
    onMutate: async (ids: string[]) => {
      await qc.cancelQueries({ queryKey: ADMIN_PROJECTS_KEY });
      const previous = qc.getQueryData<Project[]>(ADMIN_PROJECTS_KEY);

      qc.setQueryData<Project[]>(ADMIN_PROJECTS_KEY, (current) => {
        if (!current) return current;
        const orderById = new Map(ids.map((id, index) => [id, index]));
        return current.map((project) => {
          const order = orderById.get(project._id);
          return order === undefined ? project : { ...project, order };
        });
      });

      return { previous };
    },
    onError: (_error, _ids, context) => {
      if (context?.previous) {
        qc.setQueryData(ADMIN_PROJECTS_KEY, context.previous);
      }
    },
    onSettled: () => invalidateProjects(qc),
  });
}
