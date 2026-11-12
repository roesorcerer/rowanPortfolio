import request from "supertest";
import app from "../app";
import { connectTestDb, disconnectTestDb, clearDatabase } from "../test/setup";
import * as usersStore from "../stores/users-store";
import { hashPassword } from "../utils/auth.utils";

// Accounts are made out of band now (createAdmin), so tests make theirs
// through the store, hashed the same way.
async function createUser(input: {
  email: string;
  password: string;
  name: string;
}) {
  return usersStore.create({
    ...input,
    password: await hashPassword(input.password),
  });
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

// Registration was removed: the only account is the admin, made by
// `npm run admin`. This guards against the route quietly coming back.
describe("POST /api/auth/register", () => {
  it("no longer exists", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "new@example.com", password: "password123", name: "New" });

    expect(res.status).toBe(404);
    expect(await usersStore.findByEmail("new@example.com")).toBeNull();
  });
});

describe("POST /api/auth/login", () => {
  const user = {
    email: "login@example.com",
    password: "password123",
    name: "Login User",
  };

  beforeEach(async () => {
    await createUser(user);
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
    const me = { email: "me@example.com", password: "password123", name: "Me" };
    await createUser(me);
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: me.email, password: me.password });

    const token = loginRes.body.data.token;

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
