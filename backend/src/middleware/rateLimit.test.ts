import { vi } from "vitest";
import request from "supertest";
import app from "../app";
import { connectTestDb, disconnectTestDb, clearDatabase } from "../test/setup";
import * as adminsStore from "../stores/admins-store";
import { hashPassword } from "../utils/auth.utils";
import { ContactSubmissionModel } from "../models/contact-submission.model";

// Limits small enough to reach. vi.hoisted runs before every import above,
// so config reads these rather than the high values vitest.config.ts sets for
// every other file.
//
// One trusted hop means req.ip is the last X-Forwarded-For entry, so each test
// can act as a different visitor by setting that header — the same thing
// Fly's proxy does in production with two.
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
  await adminsStore.create({
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

// The counters are per process and every test in this file shares them, so
// each test uses its own IPs, and only one test makes failed logins — the
// global count it relies on is all its own, whichever tests run.
describe("login rate limit", () => {
  it("never counts successful logins", async () => {
    // More than the per-IP limit of 3, all allowed.
    for (let i = 0; i < 5; i++) {
      expect((await login("10.0.0.1", admin.password)).status).toBe(200);
    }
  });

  it("blocks an IP after 3 failures, per IP, with a global backstop", async () => {
    for (let i = 0; i < 3; i++) {
      expect((await login("10.0.0.2", "wrong")).status).toBe(401);
    }
    const perIp = await login("10.0.0.2", "wrong");
    expect(perIp.status).toBe(429);
    expect(perIp.body).toEqual({
      success: false,
      error: "Too many login attempts. Try again in 15 minutes.",
    });
    // Blocked even with the right password: the limit is on the source.
    expect((await login("10.0.0.2", admin.password)).status).toBe(429);

    // Another IP has its own count, untouched by the block above.
    for (let i = 0; i < 3; i++) {
      expect((await login("10.0.0.3", "wrong")).status).toBe(401);
    }
    for (let i = 0; i < 2; i++) {
      expect((await login("10.0.0.4", "wrong")).status).toBe(401);
    }

    // 3 + 3 + 2 = 8 failures reached the global limiter, its limit. A fresh
    // IP with the right password is now refused by the backstop.
    const global = await login("10.0.0.5", admin.password);
    expect(global.status).toBe(429);
    expect(global.body.error).toBe(
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
