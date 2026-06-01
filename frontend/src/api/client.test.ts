import type { AxiosInstance } from "axios";
import { ApiError, createApiClient } from "./client";

// A stub AxiosInstance is just an object with a `request` method that
// returns whatever the test wants. We don't need real interceptors here —
// those are wired around the http instance in production, not inside the
// client's verb logic.
function stubHttp(
  impl: (req: { url?: string; method?: string; data?: unknown }) => unknown
): AxiosInstance {
  return { request: impl } as unknown as AxiosInstance;
}

function axiosRejection(opts: {
  status?: number;
  body?: unknown;
  message?: string;
}) {
  const err = new Error(opts.message ?? "Request failed") as Error & {
    isAxiosError: boolean;
    response?: { status: number; data: unknown };
  };
  err.isAxiosError = true;
  if (opts.status !== undefined) {
    err.response = { status: opts.status, data: opts.body };
  }
  return err;
}

describe("createApiClient", () => {
  describe("success path", () => {
    it("unwraps .data.data on GET", async () => {
      const api = createApiClient(
        stubHttp(() => ({
          status: 200,
          data: { success: true, data: [{ id: 1 }, { id: 2 }] },
        }))
      );
      const result = await api.get<{ id: number }[]>("/api/things");
      expect(result).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it("forwards method and body to the http instance", async () => {
      let captured: { url?: string; method?: string; data?: unknown } = {};
      const api = createApiClient(
        stubHttp((req) => {
          captured = req;
          return { status: 200, data: { success: true, data: null } };
        })
      );
      await api.post("/api/things", { name: "hi" });
      expect(captured).toEqual({
        url: "/api/things",
        method: "post",
        data: { name: "hi" },
      });
    });

    it("returns undefined for 204 (no body)", async () => {
      const api = createApiClient(
        stubHttp(() => ({ status: 204, data: "" }))
      );
      const result = await api.delete("/api/things/1");
      expect(result).toBeUndefined();
    });
  });

  describe("envelope failure (success: false)", () => {
    it("throws ApiError with the server's error message", async () => {
      const api = createApiClient(
        stubHttp(() => ({
          status: 200,
          data: { success: false, error: "Validation failed" },
        }))
      );
      await expect(api.post("/api/things", {})).rejects.toThrow(ApiError);
      await expect(api.post("/api/things", {})).rejects.toMatchObject({
        status: 200,
        message: "Validation failed",
      });
    });
  });

  describe("HTTP error responses", () => {
    it("throws ApiError(status, server-message) on 4xx", async () => {
      const api = createApiClient(
        stubHttp(() => {
          throw axiosRejection({
            status: 401,
            body: { success: false, error: "Invalid email or password" },
          });
        })
      );
      await expect(api.post("/api/auth/login", {})).rejects.toMatchObject({
        name: "ApiError",
        status: 401,
        message: "Invalid email or password",
      });
    });

    it("falls back to axios message when the body has no error field", async () => {
      const api = createApiClient(
        stubHttp(() => {
          throw axiosRejection({
            status: 500,
            body: { weird: "shape" },
            message: "Request failed with status code 500",
          });
        })
      );
      await expect(api.get("/x")).rejects.toMatchObject({
        status: 500,
        message: "Request failed with status code 500",
      });
    });

    it("preserves the response body for debugging", async () => {
      const api = createApiClient(
        stubHttp(() => {
          throw axiosRejection({
            status: 422,
            body: { success: false, error: "Bad", fieldErrors: { name: "required" } },
          });
        })
      );
      try {
        await api.post("/x", {});
        throw new Error("should have thrown");
      } catch (err) {
        expect(err).toBeInstanceOf(ApiError);
        expect((err as ApiError).body).toEqual({
          success: false,
          error: "Bad",
          fieldErrors: { name: "required" },
        });
      }
    });
  });

  describe("network errors", () => {
    it("throws ApiError(0, message) when axios rejects without a response", async () => {
      const api = createApiClient(
        stubHttp(() => {
          throw axiosRejection({ message: "Network Error" });
        })
      );
      await expect(api.get("/x")).rejects.toMatchObject({
        name: "ApiError",
        status: 0,
        message: "Network Error",
      });
    });

    it("wraps non-axios errors too", async () => {
      const api = createApiClient(
        stubHttp(() => {
          throw new Error("boom");
        })
      );
      await expect(api.get("/x")).rejects.toMatchObject({
        name: "ApiError",
        status: 0,
        message: "boom",
      });
    });
  });
});
