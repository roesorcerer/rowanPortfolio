import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { ApiError } from "./api/client";
import { SESSION_KEY } from "./hooks/useSession";

// One factory for the browser and the prerender step, so a page renders
// against the same defaults in both. Each call is a fresh cache: the
// prerender makes one per route, so no route's data leaks into another's
// page.
//
// - staleTime: data stays "fresh" for 5 minutes (no refetch on mount).
//   Prerendered data is older than that by the time anyone reads it, so a
//   hydrated page shows the build's data at once and refetches behind it.
// - retry: 1 retry on failure (not 3, since this is a small app).
//
// Any request the server answers with a 401 means the session has expired
// or was never there, so the cached session is set to signed out and the
// admin guard redirects to the login page. This used to be an interceptor
// clearing localStorage; the session now lives in this cache instead.
export function createQueryClient(): QueryClient {
  const signOutOn401 = (error: unknown) => {
    if (error instanceof ApiError && error.status === 401) {
      client.setQueryData(SESSION_KEY, null);
    }
  };

  const client: QueryClient = new QueryClient({
    queryCache: new QueryCache({ onError: signOutOn401 }),
    mutationCache: new MutationCache({ onError: signOutOn401 }),
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        retry: 1,
      },
    },
  });
  return client;
}
