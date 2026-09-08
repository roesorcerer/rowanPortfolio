import request from "supertest";
import app from "../app";
import { connectTestDb, disconnectTestDb, clearDatabase } from "../test/setup";
import { UserModel } from "../models/user.model";
import { hashPassword } from "../utils/auth.utils";
import { signToken } from "../utils/auth.utils";

// Helper: create an admin user and return a JWT
async function getAdminToken(): Promise<string> {
  const user = await UserModel.create({
    email: "admin@test.com",
    password: await hashPassword("password123"),
    name: "Admin",
    role: "admin",
  });
  return signToken({ userId: String(user._id), role: "admin" });
}

// Helper: create a regular user and return a JWT
async function getUserToken(): Promise<string> {
  const user = await UserModel.create({
    email: "user@test.com",
    password: await hashPassword("password123"),
    name: "User",
    role: "user",
  });
  return signToken({ userId: String(user._id), role: "user" });
}

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

// Published by default: most cases here assert what the public list does,
// and a draft would simply be invisible.
const validProject = {
  title: "Test Project",
  category: "Web App",
  description: "A test project",
  image: "/assets/test.png",
  links: [{ kind: "github", url: "https://github.com/x/y" }],
  status: "published",
};

async function createProject(
  token: string,
  overrides: Record<string, unknown> = {}
) {
  const res = await request(app)
    .post("/api/projects")
    .set("Authorization", `Bearer ${token}`)
    .send({ ...validProject, ...overrides });
  return res.body.data;
}

describe("GET /api/projects", () => {
  it("returns an empty array when no projects exist", async () => {
    const res = await request(app).get("/api/projects");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
  });

  it("returns projects sorted by order", async () => {
    const token = await getAdminToken();

    await createProject(token, { title: "Second", order: 2 });
    await createProject(token, { title: "First", order: 1 });

    const res = await request(app).get("/api/projects");

    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0].title).toBe("First");
    expect(res.body.data[1].title).toBe("Second");
  });

  it("sorts featured projects ahead of the rest", async () => {
    const token = await getAdminToken();

    await createProject(token, { title: "Plain", order: 0 });
    await createProject(token, { title: "Promoted", featured: true, order: 5 });

    const res = await request(app).get("/api/projects");

    // `order` is scoped per group, so promotion has to win over the raw number.
    expect(res.body.data.map((p: { title: string }) => p.title)).toEqual([
      "Promoted",
      "Plain",
    ]);
  });

  it("hides drafts from the public list", async () => {
    const token = await getAdminToken();

    await createProject(token, { title: "Live", status: "published" });
    await createProject(token, { title: "Half-finished", status: "draft" });

    const res = await request(app).get("/api/projects");

    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe("Live");
  });

  it("returns category as an array of tags", async () => {
    const token = await getAdminToken();
    await createProject(token, { category: ["Web App", "Research"] });

    const res = await request(app).get("/api/projects");

    expect(res.body.data[0].category).toEqual(["Web App", "Research"]);
  });
});

describe("GET /api/projects/all", () => {
  it("includes drafts for an admin", async () => {
    const token = await getAdminToken();

    await createProject(token, { title: "Live", status: "published" });
    await createProject(token, { title: "Half-finished", status: "draft" });

    const res = await request(app)
      .get("/api/projects/all")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });

  it("rejects without auth", async () => {
    const res = await request(app).get("/api/projects/all");
    expect(res.status).toBe(401);
  });

  it("rejects a non-admin user", async () => {
    const token = await getUserToken();
    const res = await request(app)
      .get("/api/projects/all")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });
});

describe("PUT /api/projects/reorder", () => {
  it("rewrites the whole group's indices in one call", async () => {
    const token = await getAdminToken();

    const a = await createProject(token, { title: "A" });
    const b = await createProject(token, { title: "B" });
    const c = await createProject(token, { title: "C" });

    // Created without an explicit order, so they append 0, 1, 2.
    expect([a.order, b.order, c.order]).toEqual([0, 1, 2]);

    const res = await request(app)
      .put("/api/projects/reorder")
      .set("Authorization", `Bearer ${token}`)
      .send({ ids: [c._id, a._id, b._id] });

    expect(res.status).toBe(200);
    expect(res.body.data.reordered).toBe(3);

    const list = await request(app).get("/api/projects");
    expect(list.body.data.map((p: { title: string }) => p.title)).toEqual([
      "C",
      "A",
      "B",
    ]);
  });

  it("rejects without auth", async () => {
    const res = await request(app)
      .put("/api/projects/reorder")
      .send({ ids: ["000000000000000000000000"] });
    expect(res.status).toBe(401);
  });

  it("rejects an empty id list", async () => {
    const token = await getAdminToken();
    const res = await request(app)
      .put("/api/projects/reorder")
      .set("Authorization", `Bearer ${token}`)
      .send({ ids: [] });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/projects/:idOrSlug", () => {
  it("returns a project by ID", async () => {
    const token = await getAdminToken();

    const createRes = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send(validProject);

    const id = createRes.body.data._id;
    const res = await request(app).get(`/api/projects/${id}`);

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe("Test Project");
  });

  it("returns 404 for non-existent ID", async () => {
    const res = await request(app).get(
      "/api/projects/000000000000000000000000"
    );
    expect(res.status).toBe(404);
  });

  it("returns 404 for invalid ID format", async () => {
    const res = await request(app).get("/api/projects/not-an-id");
    expect(res.status).toBe(404);
  });

  it("resolves a project by its slug", async () => {
    const token = await getAdminToken();
    await createProject(token, { title: "Food Forward" });

    const res = await request(app).get("/api/projects/food-forward");

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe("Food Forward");
  });

  // The permalink is what a resume prints, so a draft must not be one URL
  // guess away from being readable.
  it("returns 404 for a draft, by slug or by id", async () => {
    const token = await getAdminToken();
    const draft = await createProject(token, {
      title: "Unfinished",
      status: "draft",
    });

    expect((await request(app).get("/api/projects/unfinished")).status).toBe(404);
    expect((await request(app).get(`/api/projects/${draft._id}`)).status).toBe(404);
  });

  it("serves a draft to an admin at the same permalink", async () => {
    const token = await getAdminToken();
    await createProject(token, { title: "Unfinished", status: "draft" });

    const res = await request(app)
      .get("/api/projects/all/unfinished")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe("Unfinished");
  });

  it("refuses the draft-visible lookup without an admin session", async () => {
    const token = await getAdminToken();
    await createProject(token, { title: "Unfinished", status: "draft" });

    const res = await request(app).get("/api/projects/all/unfinished");

    expect(res.status).toBe(401);
  });
});

describe("project slugs", () => {
  it("derives a slug from the title on create", async () => {
    const token = await getAdminToken();
    const project = await createProject(token, { title: "Food Forward" });

    expect(project.slug).toBe("food-forward");
  });

  it("suffixes a slug that is already taken", async () => {
    const token = await getAdminToken();
    await createProject(token, { title: "Portfolio Site" });
    const second = await createProject(token, { title: "Portfolio Site" });

    expect(second.slug).toBe("portfolio-site-2");
  });

  // The whole point of a stored slug: a resume already carries the old link.
  it("keeps the slug when the title changes", async () => {
    const token = await getAdminToken();
    const project = await createProject(token, { title: "Food Forward" });

    const res = await request(app)
      .put(`/api/projects/${project._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Food Forward v2" });

    expect(res.status).toBe(200);
    expect(res.body.data.slug).toBe("food-forward");
  });

  it("moves the slug only when one is sent explicitly", async () => {
    const token = await getAdminToken();
    const project = await createProject(token, { title: "Food Forward" });

    const res = await request(app)
      .put(`/api/projects/${project._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ slug: "Food Forward Mobile" });

    expect(res.status).toBe(200);
    expect(res.body.data.slug).toBe("food-forward-mobile");
  });

  it("never hands out a slug that shadows a sibling route", async () => {
    const token = await getAdminToken();
    const project = await createProject(token, { title: "All" });

    expect(project.slug).toBe("all-2");
  });
});

describe("project case studies", () => {
  const caseStudy = {
    summary: "How it came together.",
    role: "Sole developer",
    problem: "Shift handovers were being lost on paper.",
    sections: [
      { heading: "Shadowing a shift", body: "Watched two full services." },
      { heading: "Building the API", body: "Express and SQLite." },
    ],
    outcomes: ["Delivered to the client"],
    lessons: ["Ship the schema first"],
  };

  it("round-trips a case study through create and read", async () => {
    const token = await getAdminToken();
    await createProject(token, { title: "Food Forward", caseStudy });

    const res = await request(app).get("/api/projects/food-forward");

    expect(res.status).toBe(200);
    expect(res.body.data.caseStudy.summary).toBe("How it came together.");
    expect(res.body.data.caseStudy.sections).toHaveLength(2);
    expect(res.body.data.caseStudy.sections[0].heading).toBe("Shadowing a shift");
    expect(res.body.data.caseStudy.outcomes).toEqual(["Delivered to the client"]);
  });

  it("stores no case study when every field is blank", async () => {
    const token = await getAdminToken();
    const project = await createProject(token, {
      title: "Food Forward",
      caseStudy: { sections: [], outcomes: [], lessons: [] },
    });

    expect(project.caseStudy).toBeUndefined();
  });

  // An emptied form has to erase the stored text, not read as "unchanged".
  it("clears a stored case study when an empty one is sent", async () => {
    const token = await getAdminToken();
    const project = await createProject(token, { title: "Food Forward", caseStudy });

    const res = await request(app)
      .put(`/api/projects/${project._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ caseStudy: { sections: [], outcomes: [], lessons: [] } });

    expect(res.status).toBe(200);
    expect(res.body.data.caseStudy).toBeUndefined();
  });

  it("rejects a section missing its body", async () => {
    const token = await getAdminToken();

    const res = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({
        ...validProject,
        caseStudy: { sections: [{ heading: "Only a heading" }] },
      });

    expect(res.status).toBe(400);
  });
});

describe("POST /api/projects", () => {
  it("creates a project as admin", async () => {
    const token = await getAdminToken();

    const res = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send(validProject);

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe("Test Project");
    expect(res.body.data._id).toBeTypeOf("string");
  });

  it("defaults to a draft when status is omitted", async () => {
    const token = await getAdminToken();
    const { status: _status, ...withoutStatus } = validProject;

    const res = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send(withoutStatus);

    expect(res.body.data.status).toBe("draft");
  });

  it("appends to the end of its own display group", async () => {
    const token = await getAdminToken();

    await createProject(token, { title: "Practice 1", projectType: "practice" });
    const secondPractice = await createProject(token, {
      title: "Practice 2",
      projectType: "practice",
    });
    // A different group counts from 0 again rather than continuing globally.
    const firstResearch = await createProject(token, {
      title: "Research 1",
      projectType: "research",
    });

    expect(secondPractice.order).toBe(1);
    expect(firstResearch.order).toBe(0);
  });

  it("rejects without auth", async () => {
    const res = await request(app).post("/api/projects").send(validProject);
    expect(res.status).toBe(401);
  });

  it("rejects non-admin user", async () => {
    const token = await getUserToken();

    const res = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send(validProject);

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("Admin access required");
  });

  it("rejects invalid data", async () => {
    const token = await getAdminToken();

    const res = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "" });

    expect(res.status).toBe(400);
  });
});

describe("PUT /api/projects/:id", () => {
  it("updates a project as admin", async () => {
    const token = await getAdminToken();

    const createRes = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send(validProject);

    const id = createRes.body.data._id;

    const res = await request(app)
      .put(`/api/projects/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Updated Title" });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe("Updated Title");
    // Other fields should remain unchanged
    expect(res.body.data.category).toEqual(["Web App"]);
    expect(res.body.data.links).toEqual([
      { kind: "github", url: "https://github.com/x/y" },
    ]);
    expect(res.body.data.status).toBe("published");
  });

  it("re-appends a project that changes display group", async () => {
    const token = await getAdminToken();

    // Two featured projects already occupy the featured group at 0 and 1.
    await createProject(token, { title: "Featured 1", featured: true });
    await createProject(token, { title: "Featured 2", featured: true });
    const plain = await createProject(token, { title: "Plain", order: 0 });

    const res = await request(app)
      .put(`/api/projects/${plain._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ featured: true });

    // Keeping order 0 would have collided with "Featured 1".
    expect(res.body.data.order).toBe(2);
  });

  it("leaves order alone when the group doesn't change", async () => {
    const token = await getAdminToken();

    await createProject(token, { title: "First" });
    const second = await createProject(token, { title: "Second" });
    expect(second.order).toBe(1);

    const res = await request(app)
      .put(`/api/projects/${second._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Renamed" });

    expect(res.body.data.order).toBe(1);
  });

  it("returns 404 for non-existent project", async () => {
    const token = await getAdminToken();

    const res = await request(app)
      .put("/api/projects/000000000000000000000000")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Updated" });

    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/projects/:id", () => {
  it("deletes a project as admin", async () => {
    const token = await getAdminToken();

    const createRes = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send(validProject);

    const id = createRes.body.data._id;

    const res = await request(app)
      .delete(`/api/projects/${id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe("Project deleted");

    // Verify it's actually gone
    const getRes = await request(app).get(`/api/projects/${id}`);
    expect(getRes.status).toBe(404);
  });

  it("rejects non-admin user", async () => {
    const token = await getUserToken();
    const adminToken = await getAdminToken();

    const createRes = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(validProject);

    const res = await request(app)
      .delete(`/api/projects/${createRes.body.data._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});
