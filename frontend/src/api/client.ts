import type { ApiResponse } from "../types";

// ApiError is the only error type callers should need to know about.
// status === 0 means the request never reached the server (network error,
// CORS, DNS, etc). Otherwise status is the HTTP status code.
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown,
    options?: { cause?: unknown }
  ) {
    super(message, options);
    this.name = "ApiError";
  }
}

export interface ApiClient {
  get<T>(path: string): Promise<T>;
  post<T = void>(path: string, body?: unknown): Promise<T>;
  put<T = void>(path: string, body?: unknown): Promise<T>;
  delete<T = void>(path: string): Promise<T>;
}

type Method = "GET" | "POST" | "PUT" | "DELETE";

/** The part of fetch the client uses, so a test can hand it a stub. */
export type Fetch = (url: string, init: RequestInit) => Promise<Response>;

// Factory so tests can construct a client backed by a stub fetch. Production
// passes the real one and the API's base URL below, and exports the result
// as the default.
//
// This was axios until the public bundle needed to fit its budget
// (scripts/check-bundle.mjs): axios was the largest library in it after
// React, for one request method and an error shape, both written out here
// instead.
export function createApiClient(options: {
  baseUrl: string;
  fetch: Fetch;
}): ApiClient {
  async function request<T>(
    method: Method,
    path: string,
    body?: unknown
  ): Promise<T> {
    let response: Response;
    try {
      response = await options.fetch(`${options.baseUrl}${path}`, {
        method,
        // Sends the admin session cookie to the API host (see below).
        credentials: "include",
        // On every write, body or not, as axios did. The header makes the
        // cross-origin request preflighted, and the API's CORS refuses the
        // preflight from any origin but the site, which is half of its
        // CSRF defence (backend/src/app.ts). A GET stays a simple request.
        headers:
          method === "GET" ? undefined : { "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch (err) {
      // fetch rejects only when no response arrived: offline, DNS, CORS.
      throw new ApiError(
        0,
        (err instanceof Error && err.message) || "Request failed",
        undefined,
        { cause: err }
      );
    }

    const envelope = await readBody(response);
    if (!response.ok) {
      const serverMessage =
        envelope && typeof envelope === "object" && "error" in envelope
          ? String((envelope as { error?: unknown }).error ?? "")
          : "";
      throw new ApiError(
        response.status,
        serverMessage || `Request failed with status code ${response.status}`,
        envelope
      );
    }
    // Empty 204 / 205 responses have no envelope: treat as void.
    if (envelope === undefined) return undefined as T;
    const typed = envelope as ApiResponse<T>;
    if (typed.success === false) {
      throw new ApiError(
        response.status,
        typed.error ?? "Request failed",
        envelope
      );
    }
    return typed.data as T;
  }

  return {
    get: (path) => request("GET", path),
    post: (path, body) => request("POST", path, body),
    put: (path, body) => request("PUT", path, body),
    delete: (path) => request("DELETE", path),
  };
}

// The parsed JSON, the raw text when it isn't JSON (a proxy's HTML error
// page, say: kept for debugging, as `ApiError.body`), or undefined when
// there's nothing.
async function readBody(response: Response): Promise<unknown> {
  const text = await response.text().catch(() => "");
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// --- Production wiring ---
// In development, Vite's proxy handles /api requests (no baseURL needed).
// In production on Vercel, VITE_API_URL points to the Fly.io backend.
//
// apiUrl() is the same base for the one caller that can't use this client:
// the analytics adapter, which needs sendBeacon and keepalive fetch. Calling
// Fly directly matters for more than speed — the backend reads the
// visitor's IP from X-Forwarded-For assuming only Fly's proxy is in front
// (TRUST_PROXY_HOPS=2). A request through Vercel's /api rewrite arrives
// with an extra hop and shows up as a Vercel server. Read at call time, not
// import time, so a test can stub the variable.
export function apiUrl(path: string): string {
  return `${import.meta.env.VITE_API_URL || ""}${path}`;
}

// credentials: "include" sends the admin session cookie to the API host.
// There is no token to attach any more: the cookie is HttpOnly, so this
// module can't read it and doesn't need to (src/api/auth.ts). A 401 is
// handled where the session state lives, in main.tsx.
//
// In production the API is api.rowan.page, a subdomain of the site, which
// is what lets the browser treat the cookie as first-party; on a different
// site (the old *.fly.dev host) Safari would refuse it.
//
// fetch is wrapped rather than passed bare: called detached from window, as
// `options.fetch(...)` would call it, some browsers throw "Illegal
// invocation".
const api: ApiClient = createApiClient({
  baseUrl: import.meta.env.VITE_API_URL || "",
  fetch: (url, init) => fetch(url, init),
});
export default api;
