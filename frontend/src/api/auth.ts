import api from "./client";

// Owns the auth token lifecycle. Components don't touch localStorage directly.

const TOKEN_KEY = "token";

interface LoginResponse {
  token: string;
  user: { _id: string; email: string; role: string };
}

export async function login(email: string, password: string): Promise<void> {
  const result = await api.post<LoginResponse>("/api/auth/login", {
    email,
    password,
  });
  localStorage.setItem(TOKEN_KEY, result.token);
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return localStorage.getItem(TOKEN_KEY) !== null;
}
