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

const validProject = {
  title: "Test Project",
  category: "Web App",
  description: "A test project",
  image: "/assets/test.png",
  technologies: ["React"],
};

describe("GET /api/projects", () => {
  it("returns an empty array when no projects exist", async () => {
    const res = await request(app).get("/api/projects");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
  });

  it("returns projects sorted by order", async () => {
    const token = await getAdminToken();

    await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({ ...validProject, title: "Second", order: 2 });
    await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({ ...validProject, title: "First", order: 1 });

    const res = await request(app).get("/api/projects");

    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0].title).toBe("First");
    expect(res.body.data[1].title).toBe("Second");
  });
});

describe("GET /api/projects/:id", () => {
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
    expect(res.body.data.category).toBe("Web App");
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
