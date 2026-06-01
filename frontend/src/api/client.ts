import axios, { type AxiosInstance, type AxiosError } from "axios";
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

// Factory so tests can construct a client backed by a stub AxiosInstance.
// Production wires the real axios instance below and exports the result as
// the default. The factory itself knows nothing about baseURL, headers, or
// interceptors — those live on the AxiosInstance passed in.
export function createApiClient(http: AxiosInstance): ApiClient {
  async function request<T>(
    method: "get" | "post" | "put" | "delete",
    path: string,
    body?: unknown
  ): Promise<T> {
    try {
      const response = await http.request<ApiResponse<T>>({
        url: path,
        method,
        data: body,
      });
      const envelope = response.data as ApiResponse<T> | "" | null | undefined;
      // Empty 204 / 205 responses come back as "" or undefined — treat as void.
      if (envelope === undefined || envelope === "" || envelope === null) {
        return undefined as T;
      }
      if (envelope.success === false) {
        throw new ApiError(
          response.status,
          envelope.error ?? "Request failed",
          envelope
        );
      }
      return envelope.data as T;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw toApiError(err);
    }
  }

  return {
    get: (path) => request("get", path),
    post: (path, body) => request("post", path, body),
    put: (path, body) => request("put", path, body),
    delete: (path) => request("delete", path),
  };
}

function toApiError(err: unknown): ApiError {
  if (isAxiosError(err)) {
    const status = err.response?.status ?? 0;
    const body = err.response?.data;
    const message =
      (body && typeof body === "object" && "error" in body
        ? String((body as { error?: unknown }).error ?? "")
        : "") ||
      err.message ||
      "Request failed";
    return new ApiError(status, message, body, { cause: err });
  }
  if (err instanceof Error) {
    return new ApiError(0, err.message || "Request failed", undefined, {
      cause: err,
    });
  }
  return new ApiError(0, "Request failed", undefined, { cause: err });
}

function isAxiosError(err: unknown): err is AxiosError {
  return (
    typeof err === "object" &&
    err !== null &&
    (err as { isAxiosError?: boolean }).isAxiosError === true
  );
}

// --- Production wiring ---
// In development, Vite's proxy handles /api requests (no baseURL needed).
// In production on Vercel, VITE_API_URL points to the Fly.io backend.
const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  headers: { "Content-Type": "application/json" },
});

// Attach the JWT to every request.
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Clear an expired/invalid token on 401 so the next render sees the
// unauthenticated state. The ApiError still propagates so callers can react.
http.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
    }
    return Promise.reject(error);
  }
);

const api: ApiClient = createApiClient(http);
export default api;
