import "../config";
import request from "supertest";
import app from "../app";

// The 413 that started this: a body over the transport limit used to fail with
// an opaque "request entity too large" — and in production with "Internal
// server error", which points the reader at the wrong side of the wire.

describe("oversized request bodies", () => {
  it("answers a too-large body with an explanation of the likely cause", async () => {
    // Comfortably past the 512kb parser limit.
    const res = await request(app)
      .post("/api/projects")
      .set("Content-Type", "application/json")
      .send(JSON.stringify({ title: "x", blob: "A".repeat(700_000) }));

    expect(res.status).toBe(413);
    expect(res.body.error).toMatch(/too large/i);
    expect(res.body.error).toMatch(/frontend\/public\/assets/);
  });

  it("accepts a body the old 10kb limit would have refused", async () => {
    // ~40kb of prose — a real case study. It gets past the body parser and is
    // then rejected by auth, which is the point: the size is no longer the
    // thing standing in the way.
    const res = await request(app)
      .post("/api/projects")
      .send({ title: "x", description: "A".repeat(40_000) });

    expect(res.status).not.toBe(413);
  });
});
