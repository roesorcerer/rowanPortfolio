import { ApiError, createApiClient, type Fetch } from "./client";

// The client is built on a stub fetch that returns real Response objects,
// so these exercise the same status, header and body handling the browser
// would, without a network.

interface Captured {
  url: string;
  init: RequestInit;
}

function clientReturning(response: () => Response, calls: Captured[] = []) {
  const fetch: Fetch = (url, init) => {
    calls.push({ url, init });
    return Promise.resolve(response());
  };
  return createApiClient({ baseUrl: "https://api.example", fetch });
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

describe("createApiClient", () => {
  describe("success path", () => {
    it("unwraps the envelope's data on GET", async () => {
      const api = clientReturning(() =>
        json(200, { success: true, data: [{ id: 1 }, { id: 2 }] })
      );
      const result = await api.get<{ id: number }[]>("/api/things");
      expect(result).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it("sends method, JSON body and the session cookie to the base URL", async () => {
      const calls: Captured[] = [];
      const api = clientReturning(
        () => json(201, { success: true, data: null }),
        calls
      );
      await api.post("/api/things", { name: "hi" });
      expect(calls).toHaveLength(1);
      expect(calls[0]?.url).toBe("https://api.example/api/things");
      expect(calls[0]?.init).toMatchObject({
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "hi" }),
      });
    });

    // The header is what makes a cross-origin write preflighted, which the
    // API's CORS then refuses for any other site; a body-less logout needs
    // it as much as a save does.
    it("marks every write as JSON, with or without a body", async () => {
      const calls: Captured[] = [];
      const api = clientReturning(
        () => new Response(null, { status: 204 }),
        calls
      );
      await api.post("/api/auth/logout");
      await api.delete("/api/things/1");
      await api.get("/api/things");
      expect(calls.map((c) => c.init.headers)).toEqual([
        { "Content-Type": "application/json" },
        { "Content-Type": "application/json" },
        undefined,
      ]);
    });

    it("returns undefined for 204 (no body)", async () => {
      const api = clientReturning(() => new Response(null, { status: 204 }));
      const result = await api.delete("/api/things/1");
      expect(result).toBeUndefined();
    });
  });

  describe("envelope failure (success: false)", () => {
    it("throws ApiError with the server's error message", async () => {
      const api = clientReturning(() =>
        json(200, { success: false, error: "Validation failed" })
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
      const api = clientReturning(() =>
        json(401, { success: false, error: "Invalid email or password" })
      );
      await expect(api.post("/api/auth/login", {})).rejects.toMatchObject({
        name: "ApiError",
        status: 401,
        message: "Invalid email or password",
      });
    });

    it("names the status when the body has no error field", async () => {
      const api = clientReturning(() => json(500, { weird: "shape" }));
      await expect(api.get("/x")).rejects.toMatchObject({
        status: 500,
        message: "Request failed with status code 500",
      });
    });

    it("preserves the response body for debugging", async () => {
      const api = clientReturning(() =>
        json(422, {
          success: false,
          error: "Bad",
          fieldErrors: { name: "required" },
        })
      );
      const err = await api.post("/x", {}).catch((e: unknown) => e);
      expect(err).toBeInstanceOf(ApiError);
      expect(err).toMatchObject({
        body: {
          success: false,
          error: "Bad",
          fieldErrors: { name: "required" },
        },
      });
    });

    // A proxy in front of the API can answer with an HTML page.
    it("keeps a body that isn't JSON as text", async () => {
      const api = clientReturning(
        () => new Response("<h1>Bad gateway</h1>", { status: 502 })
      );
      await expect(api.get("/x")).rejects.toMatchObject({
        status: 502,
        message: "Request failed with status code 502",
        body: "<h1>Bad gateway</h1>",
      });
    });
  });

  describe("network errors", () => {
    it("throws ApiError(0, message) when no response arrives", async () => {
      const api = createApiClient({
        baseUrl: "",
        fetch: () => Promise.reject(new TypeError("Failed to fetch")),
      });
      await expect(api.get("/x")).rejects.toMatchObject({
        name: "ApiError",
        status: 0,
        message: "Failed to fetch",
      });
    });

    it("wraps a rejection that isn't an Error too", async () => {
      const api = createApiClient({
        baseUrl: "",
        fetch: () => Promise.reject("boom"),
      });
      await expect(api.get("/x")).rejects.toMatchObject({
        name: "ApiError",
        status: 0,
        message: "Request failed",
      });
    });
  });
});
