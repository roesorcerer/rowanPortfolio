import request from "supertest";
import app from "../app";
import { connectTestDb, disconnectTestDb, clearDatabase } from "../test/setup";
import { PageViewModel } from "../models/page-view.model";
import { EventModel } from "../models/event.model";

beforeAll(async () => {
  await connectTestDb();
});

afterAll(async () => {
  await clearDatabase();
  await disconnectTestDb();
});

beforeEach(async () => {
  await clearDatabase();
});

// How the browser sends it: JSON in a text/plain body, so the cross-origin
// request is a simple one with no preflight.
function asBrowser(url: string, body: unknown) {
  return request(app)
    .post(url)
    .set("Content-Type", "text/plain")
    .send(JSON.stringify(body));
}

describe("POST /api/analytics/pageview", () => {
  it("records a page view sent as text/plain JSON", async () => {
    const res = await asBrowser("/api/analytics/pageview", {
      path: "/projects/food-forward",
      referrer: "https://www.linkedin.com/",
    });

    expect(res.status).toBe(204);
    const saved = await PageViewModel.find().lean();
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({
      path: "/projects/food-forward",
      referrer: "https://www.linkedin.com/",
    });
  });

  it("still accepts application/json", async () => {
    const res = await request(app)
      .post("/api/analytics/pageview")
      .send({ path: "/" });

    expect(res.status).toBe(204);
    expect(await PageViewModel.countDocuments()).toBe(1);
  });

  // This used to reach .slice() on a number and come back as a 500.
  it("rejects a non-string path with a 400, not a 500", async () => {
    const res = await asBrowser("/api/analytics/pageview", { path: 123 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(await PageViewModel.countDocuments()).toBe(0);
  });

  it("rejects a missing path", async () => {
    const res = await asBrowser("/api/analytics/pageview", {});

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/path/);
  });

  it("rejects a path that isn't a path", async () => {
    const res = await asBrowser("/api/analytics/pageview", {
      path: "https://elsewhere.example/",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/path must start with \//);
  });

  it("rejects a body that isn't JSON", async () => {
    const res = await request(app)
      .post("/api/analytics/pageview")
      .set("Content-Type", "text/plain")
      .send("not json");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Body is not valid JSON");
  });

  // Intake clips, never rejects, on length (docs/adr/0001).
  it("clips an over-long path and referrer instead of rejecting them", async () => {
    const res = await asBrowser("/api/analytics/pageview", {
      path: "/" + "a".repeat(600),
      referrer: "https://example.com/" + "b".repeat(600),
    });

    expect(res.status).toBe(204);
    const saved = await PageViewModel.findOne().lean();
    expect(saved?.path).toHaveLength(512);
    expect(saved?.referrer).toHaveLength(512);
  });

  it("ignores admin paths", async () => {
    const res = await asBrowser("/api/analytics/pageview", {
      path: "/admin/projects",
    });

    expect(res.status).toBe(204);
    expect(await PageViewModel.countDocuments()).toBe(0);
  });
});

describe("POST /api/analytics/event", () => {
  it("records an event sent as text/plain JSON", async () => {
    const res = await asBrowser("/api/analytics/event", {
      eventType: "link_click",
      projectId: "p1",
      projectTitle: "Food Forward",
      linkType: "demo",
      path: "/",
      referrer: "",
    });

    expect(res.status).toBe(204);
    const saved = await EventModel.findOne().lean();
    expect(saved).toMatchObject({
      eventType: "link_click",
      projectId: "p1",
      linkType: "demo",
    });
  });

  it("rejects an event with no type", async () => {
    const res = await asBrowser("/api/analytics/event", { projectId: "p1" });

    expect(res.status).toBe(400);
    expect(await EventModel.countDocuments()).toBe(0);
  });
});
