import request from "supertest";
import app from "../app";

// Nothing here touches the database: reports are logged, not stored.

let warn: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
});

afterEach(() => {
  warn.mockRestore();
});

const logged = () => warn.mock.calls.map((call) => String(call[0]));

describe("POST /api/csp-report", () => {
  it("logs a report-uri violation (Safari, Firefox)", async () => {
    const res = await request(app)
      .post("/api/csp-report")
      .set("Content-Type", "application/csp-report")
      .send(
        JSON.stringify({
          "csp-report": {
            "document-uri": "https://rowan.page/",
            "effective-directive": "script-src-elem",
            "blocked-uri": "https://evil.example/x.js",
            disposition: "report",
          },
        })
      );

    expect(res.status).toBe(204);
    expect(logged()).toEqual([
      "[csp] report script-src-elem blocked=https://evil.example/x.js page=https://rowan.page/ source=-",
    ]);
  });

  it("logs each violation in a report-to batch and skips other types", async () => {
    const res = await request(app)
      .post("/api/csp-report")
      .set("Content-Type", "application/reports+json")
      .send(
        JSON.stringify([
          {
            type: "csp-violation",
            body: {
              documentURL: "https://rowan.page/resume",
              effectiveDirective: "img-src",
              blockedURL: "https://cdn.example/a.png",
              disposition: "report",
            },
          },
          { type: "deprecation", body: { id: "x" } },
        ])
      );

    expect(res.status).toBe(204);
    expect(logged()).toHaveLength(1);
    expect(logged()[0]).toContain("img-src blocked=https://cdn.example/a.png");
  });

  it("clips a long blocked URL to keep one report one short line", async () => {
    await request(app)
      .post("/api/csp-report")
      .set("Content-Type", "application/csp-report")
      .send(
        JSON.stringify({
          "csp-report": {
            "effective-directive": "img-src",
            "blocked-uri": `data:image/png;base64,${"A".repeat(5000)}`,
          },
        })
      );

    expect(logged()[0]!.length).toBeLessThan(400);
  });

  it("can't be made to write a second log line", async () => {
    await request(app)
      .post("/api/csp-report")
      .set("Content-Type", "application/csp-report")
      .send(
        JSON.stringify({
          "csp-report": {
            "effective-directive": "img-src",
            "blocked-uri": "https://x.example/\n[csp] forged line",
          },
        })
      );

    expect(logged()).toHaveLength(1);
    expect(logged()[0]).not.toContain("\n");
  });

  // The sender is a browser; an error only adds noise to a visitor's console.
  it("answers 204 to a body that isn't JSON, and logs nothing", async () => {
    const res = await request(app)
      .post("/api/csp-report")
      .set("Content-Type", "application/csp-report")
      .send("{not json");

    expect(res.status).toBe(204);
    expect(logged()).toEqual([]);
  });
});
