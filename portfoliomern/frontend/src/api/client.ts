import axios from "axios";

// Create a pre-configured Axios instance.
// All API calls go through this client, so you configure
// base URL, headers, and interceptors in one place.
const api = axios.create({
  // In development, Vite's proxy handles /api requests (no baseURL needed).
  // In production on Vercel, VITE_API_URL points to the Fly.io backend
  // (e.g., "https://your-app.fly.dev"). Vite bakes env vars starting with
  // VITE_ into the bundle at build time.
  baseURL: import.meta.env.VITE_API_URL || "",
  headers: {
    "Content-Type": "application/json",
  },
});

// --- Request Interceptor ---
// Automatically attach the JWT token to every request.
// This means individual API calls don't need to worry about auth.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Response Interceptor ---
// Unwrap the Axios response to return just the data.
// Also handle 401s globally (token expired, etc.).
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired — clear it.
      // A more sophisticated app would redirect to login,
      // but for a portfolio site this is sufficient.
      localStorage.removeItem("token");
    }
    return Promise.reject(error);
  }
);

export default api;
