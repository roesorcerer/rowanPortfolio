import api, { ApiError } from "./client";

// Owns the admin session lifecycle. The session itself is an HttpOnly cookie
// the backend sets on login (backend/src/utils/session-cookie.ts), so this
// module never sees a token: it can sign in, sign out, and ask the server
// who is signed in, and that is all JavaScript is able to do with it. That
// is the point. The token used to live in localStorage, where any script on
// the page could read it.

export interface SessionAdmin {
  _id: string;
  email: string;
  name: string;
}

// The pre-cookie token, if this browser still has one. The backend no
// longer reads it, so it's inert, but a signed session has no business
// sitting in storage for its remaining days.
try {
  localStorage.removeItem("token");
} catch {
  // Storage can be unavailable (private mode, blocked site data). Nothing
  // to clear then.
}

export async function login(email: string, password: string): Promise<void> {
  await api.post("/api/auth/login", { email, password });
}

export async function logout(): Promise<void> {
  await api.post("/api/auth/logout");
}

// Who the session cookie belongs to, or null when there isn't a valid one.
// A 401 is an answer here, not a failure: it's how a signed-out browser
// learns it is signed out, since it can't see the cookie to check.
export async function getSession(): Promise<SessionAdmin | null> {
  try {
    const { admin } = await api.get<{ admin: SessionAdmin }>("/api/auth/me");
    return admin;
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return null;
    throw err;
  }
}
