import { useQuery } from "@tanstack/react-query";
import { getProjects } from "../api/projects";

// Custom hook that wraps React Query's useQuery.
// Components call useProjects() and get back:
//   - data: the projects array (undefined while loading)
//   - isLoading: true during the initial fetch
//   - error: any error that occurred
//
// React Query handles caching, deduplication, and background refetching
// automatically. If two components call useProjects(), only one API
// request is made.
export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });
}
