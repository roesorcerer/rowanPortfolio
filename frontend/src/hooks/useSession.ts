import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSession, login, logout } from "../api/auth";

// The signed-in admin, or null. React Query owns it like any other server
// state: the guard, the login page, and the 401 handler in main.tsx all read
// and write this one key, so they can't disagree about who is signed in.
export const SESSION_KEY = ["session"] as const;

export function useSession() {
  return useQuery({
    queryKey: SESSION_KEY,
    queryFn: getSession,
    // getSession already turns a 401 into null; anything left is a network
    // or server failure, and retrying it once is the app default anyway.
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { email: string; password: string }) =>
      login(input.email, input.password),
    // Refetch rather than trust the login response, so the guard checks the
    // cookie actually came back. A browser refusing it would otherwise look
    // signed in until the first admin request.
    onSuccess: () => qc.invalidateQueries({ queryKey: SESSION_KEY }),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: logout,
    // Everything cached while signed in (drafts, messages, analytics) goes,
    // not just the session, so nothing admin-only outlives it in memory.
    onSettled: () => {
      qc.clear();
      qc.setQueryData(SESSION_KEY, null);
    },
  });
}
