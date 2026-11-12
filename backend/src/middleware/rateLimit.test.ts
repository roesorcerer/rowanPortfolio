import { vi } from "vitest";
import request from "supertest";
import app from "../app";
import { connectTestDb, disconnectTestDb, clearDatabase } from "../test/setup";
import * as usersStore from "../stores/users-store";
import { hashPassword } from "../utils/auth.utils";
import { ContactSubmissionModel } from "../models/contact-submission.model";

// Limits small enough to reach. vi.hoisted runs before every import above,
// so config reads these rather than the high values vitest.config.ts sets for
// every other file.
//
// One trusted hop means req.ip is the last X-Forwarded-For entry, so each test
// can act as a different visitor by setting that header — the same thing
// Vercel and Fly do in production with two hops.
vi.hoisted(() => {
  process.env.TRUST_PROXY_HOPS = "1";
  process.env.RATE_LIMIT_LOGIN_PER_IP = "3";
  process.env.RATE_LIMIT_LOGIN_GLOBAL = "8";
  process.env.RATE_LIMIT_CONTACT_PER_IP = "2";
  process.env.RATE_LIMIT_CONTACT_GLOBAL = "1000";
});

const sendContactEmail = vi.fn();
vi.mock("../services/mailer.service", () => ({
  sendContactEmail: (...args: unknown[]) => sendContactEmail(...args),
}));

const admin = {
  email: "admin@example.com",
  password: "password123",
  name: "A",
};

beforeAll(async () => {
  await connectTestDb();
  await clearDatabase();
  await usersStore.create({
    ...admin,
    password: await hashPassword(admin.password),
  });
});

afterAll(async () => {
  await clearDatabase();
  await disconnectTestDb();
});

beforeEach(() => {
  sendContactEmail.mockReset();
  sendContactEmail.mockResolvedValue(undefined);
});

function login(ip: string, password: string) {
  return request(app)
    .post("/api/auth/login")
    .set("X-Forwarded-For", ip)
    .send({ email: admin.email, password });
}

// The counters are per process and these tests share them, so they run in
// order and the global-limit test counts on the failures before it. The
// running total of failed logins is noted at each step.
describe("login rate limit", () => {
  it("counts failed attempts only, and blocks the fourth from one IP", async () => {
    for (let i = 0; i < 5; i++) {
      expect((await login("10.0.0.1", admin.password)).status).toBe(200);
    }

    for (let i = 0; i < 3; i++) {
      expect((await login("10.0.0.1", "wrong")).status).toBe(401);
    }
    // Global failures: 3.

    const blocked = await login("10.0.0.1", "wrong");
    expect(blocked.status).toBe(429);
    expect(blocked.body).toEqual({
      success: false,
      error: "Too many login attempts. Try again in 15 minutes.",
    });

    // Blocked even with the right password: the limit is on the source.
    expect((await login("10.0.0.1", admin.password)).status).toBe(429);
  });

  it("keeps each IP's count separate", async () => {
    for (let i = 0; i < 3; i++) {
      expect((await login("10.0.0.2", "wrong")).status).toBe(401);
    }
    // Global failures: 6.
  });

  it("caps failures across all IPs with the global backstop", async () => {
    for (let i = 0; i < 2; i++) {
      expect((await login("10.0.0.3", "wrong")).status).toBe(401);
    }
    // Global failures: 8, the global limit. A fresh IP is now refused.

    const blocked = await login("10.0.0.4", admin.password);
    expect(blocked.status).toBe(429);
    expect(blocked.body.error).toBe(
      "Login is temporarily unavailable. Try again in 15 minutes."
    );
  });
});

describe("contact rate limit", () => {
  const message = {
    name: "Ada Lovelace",
    email: "ada@example.com",
    message: "I'd love to chat about your HCI research.",
  };

  function contact(ip: string, body: object) {
    return request(app)
      .post("/api/contact")
      .set("X-Forwarded-For", ip)
      .send(body);
  }

  it("accepts two messages per IP, then refuses before saving or emailing", async () => {
    expect((await contact("10.0.1.1", message)).status).toBe(202);
    expect((await contact("10.0.1.1", message)).status).toBe(202);

    const blocked = await contact("10.0.1.1", message);
    expect(blocked.status).toBe(429);
    expect(blocked.body).toEqual({
      success: false,
      error: "Too many messages from your connection. Try again in an hour.",
    });

    expect(await ContactSubmissionModel.countDocuments()).toBe(2);
    expect(sendContactEmail).toHaveBeenCalledTimes(2);
  });

  it("counts rejected messages too", async () => {
    expect((await contact("10.0.1.2", {})).status).toBe(400);
    expect((await contact("10.0.1.2", {})).status).toBe(400);
    expect((await contact("10.0.1.2", message)).status).toBe(429);
  });
});
