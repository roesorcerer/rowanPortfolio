import request from "supertest";
import app from "../app";
import { connectTestDb, disconnectTestDb, clearDatabase } from "../test/setup";
import * as adminsStore from "../stores/admins-store";
import { hashPassword, signToken } from "../utils/auth.utils";
import { SESSION_COOKIE } from "../utils/session-cookie";

// Accounts are made out of band now (createAdmin), so tests make theirs
// through the store, hashed the same way.
async function createAdmin(input: {
  email: string;
  password: string;
  name: string;
}) {
  return adminsStore.create({
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

// The session cookie from a response, as the browser would store it.
function sessionCookieOf(res: request.Response): string | undefined {
  const raw = res.headers["set-cookie"];
  const cookies = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return cookies.find((c) => c.startsWith(`${SESSION_COOKIE}=`));
}

// Registration was removed: the only account is the admin, made by
// `npm run admin`. This guards against the route quietly coming back.
describe("POST /api/auth/register", () => {
  it("no longer exists", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "new@example.com", password: "password123", name: "New" });

    expect(res.status).toBe(404);
    expect(await adminsStore.findByEmail("new@example.com")).toBeNull();
  });
});

describe("POST /api/auth/login", () => {
  const admin = {
    email: "login@example.com",
    password: "password123",
    name: "Login Admin",
  };

  beforeEach(async () => {
    await createAdmin(admin);
  });

  it("logs in with valid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: admin.email, password: admin.password });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.admin.email).toBe(admin.email);
    expect(res.body.data.admin).not.toHaveProperty("role");
    expect(res.body.data.admin).not.toHaveProperty("password");
  });

  // The whole change: the token reaches the browser only as a cookie that
  // JavaScript can't read, and never in the body where it could.
  it("sets the session as an HttpOnly, SameSite=Strict cookie", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: admin.email, password: admin.password });

    expect(res.body.data).not.toHaveProperty("token");
    const cookie = sessionCookieOf(res);
    expect(cookie).toBeDefined();
    expect(cookie).toMatch(/; HttpOnly/);
    expect(cookie).toMatch(/; SameSite=Strict/);
    expect(cookie).toMatch(/; Path=\/api/);
    // Expires with the token (JWT_EXPIRES_IN), not at browser close.
    expect(cookie).toMatch(/; Expires=/);
  });

  it("sets no cookie on a failed login", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: admin.email, password: "wrongpassword" });

    expect(sessionCookieOf(res)).toBeUndefined();
  });

  it("rejects wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: admin.email, password: "wrongpassword" });

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
  it("returns the admin whose session cookie came back", async () => {
    const me = { email: "me@example.com", password: "password123", name: "Me" };
    await createAdmin(me);
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: me.email, password: me.password });

    const cookie = sessionCookieOf(loginRes);
    if (!cookie) throw new Error("login set no session cookie");

    // Sent back the way a browser would: name=value only.
    const res = await request(app)
      .get("/api/auth/me")
      .set("Cookie", cookie.split(";")[0]);

    expect(res.status).toBe(200);
    expect(res.body.data.admin.email).toBe("me@example.com");
  });

  it("rejects a request with no session cookie", async () => {
    const res = await request(app).get("/api/auth/me");

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Authentication required");
  });

  it("rejects an invalid session cookie", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Cookie", `${SESSION_COOKIE}=invalid.token.here`);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid or expired token");
  });

  // A valid token in the old place must not work: that path is what the
  // cookie replaced, and leaving it open would keep tokens in JavaScript.
  it("no longer accepts a Bearer token", async () => {
    const admin = await createAdmin({
      email: "bearer@example.com",
      password: "password123",
      name: "Bearer",
    });

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${signToken({ adminId: admin._id })}`);

    expect(res.status).toBe(401);
  });
});

describe("POST /api/auth/logout", () => {
  it("clears the session cookie", async () => {
    const res = await request(app).post("/api/auth/logout");

    expect(res.status).toBe(204);
    const cookie = sessionCookieOf(res);
    // Cleared means emptied and dated in the past, on the same path.
    expect(cookie).toMatch(new RegExp(`^${SESSION_COOKIE}=;`));
    expect(cookie).toMatch(/Expires=Thu, 01 Jan 1970/);
    expect(cookie).toMatch(/; Path=\/api/);
  });
});
