import React from "react";
import ReactDOM from "react-dom/client";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ApiError } from "./api/client";
import { SESSION_KEY } from "./hooks/useSession";
import App from "./App";
import "./index.css";

// QueryClient manages the cache for all React Query hooks.
// These defaults are sensible for a portfolio site:
// - staleTime: data stays "fresh" for 5 minutes (no refetch on mount)
// - retry: 1 retry on failure (not 3, since this is a small app)
//
// Any request the server answers with a 401 means the session has expired
// or was never there, so the cached session is set to signed out and the
// admin guard redirects to the login page. This used to be an interceptor
// clearing localStorage; the session now lives in this cache instead.
function signOutOn401(error: unknown) {
  if (error instanceof ApiError && error.status === 401) {
    queryClient.setQueryData(SESSION_KEY, null);
  }
}

const queryClient: QueryClient = new QueryClient({
  queryCache: new QueryCache({ onError: signOutOn401 }),
  mutationCache: new MutationCache({ onError: signOutOn401 }),
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
