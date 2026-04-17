import request from "supertest";
import app from "../app";
import { connectTestDb, disconnectTestDb, clearDatabase } from "../test/setup";

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

describe("POST /api/auth/register", () => {
  const validUser = {
    email: "test@example.com",
    password: "password123",
    name: "Test User",
  };

  it("registers a new user and returns a token", async () => {
    const res = await request(app).post("/api/auth/register").send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeTypeOf("string");
    expect(res.body.data.user.email).toBe("test@example.com");
    expect(res.body.data.user.name).toBe("Test User");
    expect(res.body.data.user.role).toBe("user");
    // Password should never appear in the response
    expect(res.body.data.user.password).toBeUndefined();
  });

  it("rejects duplicate email", async () => {
    await request(app).post("/api/auth/register").send(validUser);
    const res = await request(app).post("/api/auth/register").send(validUser);

    expect(res.status).toBe(409);
    expect(res.body.error).toBe("Email already registered");
  });

  it("rejects invalid email", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...validUser, email: "bad" });

    expect(res.status).toBe(400);
  });

  it("rejects short password", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...validUser, password: "short" });

    expect(res.status).toBe(400);
  });

  it("rejects missing name", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "a@b.com", password: "password123" });

    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/login", () => {
  const user = {
    email: "login@example.com",
    password: "password123",
    name: "Login User",
  };

  beforeEach(async () => {
    await request(app).post("/api/auth/register").send(user);
  });

  it("logs in with valid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: user.password });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeTypeOf("string");
    expect(res.body.data.user.email).toBe(user.email);
  });

  it("rejects wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: "wrongpassword" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid email or password");
  });

  it("rejects non-existent email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@example.com", password: "password123" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid email or password");
  });
});

describe("GET /api/auth/me", () => {
  it("returns the authenticated user", async () => {
    const registerRes = await request(app)
      .post("/api/auth/register")
      .send({ email: "me@example.com", password: "password123", name: "Me" });

    const token = registerRes.body.data.token;

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe("me@example.com");
  });

  it("rejects request without token", async () => {
    const res = await request(app).get("/api/auth/me");

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Authentication required");
  });

  it("rejects invalid token", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer invalid.token.here");

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid or expired token");
  });
});
