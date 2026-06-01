import { vi } from "vitest";
import request from "supertest";
import { connectTestDb, disconnectTestDb, clearDatabase } from "../test/setup";
import { ContactSubmissionModel } from "../models/contact-submission.model";

// Mock the mailer BEFORE importing the app so the route pulls in the mock.
const sendContactEmail = vi.fn();
vi.mock("../services/mailer.service", () => ({
  sendContactEmail: (...args: unknown[]) => sendContactEmail(...args),
}));

import app from "../app";

beforeAll(async () => {
  await connectTestDb();
});

afterAll(async () => {
  await clearDatabase();
  await disconnectTestDb();
});

beforeEach(async () => {
  await clearDatabase();
  sendContactEmail.mockReset();
  sendContactEmail.mockResolvedValue(undefined);
});

describe("POST /api/contact", () => {
  const validPayload = {
    name: "Ada Lovelace",
    email: "ada@example.com",
    message: "I'd love to chat about your HCI research.",
  };

  it("persists the submission and calls the mailer on success", async () => {
    const res = await request(app).post("/api/contact").send(validPayload);

    expect(res.status).toBe(202);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toMatch(/message sent/i);

    expect(sendContactEmail).toHaveBeenCalledTimes(1);
    expect(sendContactEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Ada Lovelace",
        email: "ada@example.com",
        message: expect.stringContaining("HCI"),
      })
    );

    const stored = await ContactSubmissionModel.find();
    expect(stored).toHaveLength(1);
    expect(stored[0].email).toBe("ada@example.com");
  });

  it("still returns 202 and persists when the mailer throws", async () => {
    sendContactEmail.mockRejectedValueOnce(new Error("SMTP down"));

    const res = await request(app).post("/api/contact").send(validPayload);

    // The message is captured even though delivery failed — the visitor
    // sees a different success copy that doesn't promise delivery.
    expect(res.status).toBe(202);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toMatch(/received/i);
    expect(res.body.data.message).not.toMatch(/sent/i);

    const stored = await ContactSubmissionModel.find();
    expect(stored).toHaveLength(1);
  });

  it("rejects invalid email without persisting or calling the mailer", async () => {
    const res = await request(app)
      .post("/api/contact")
      .send({ ...validPayload, email: "nope" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(sendContactEmail).not.toHaveBeenCalled();

    const stored = await ContactSubmissionModel.find();
    expect(stored).toHaveLength(0);
  });

  it("rejects short messages", async () => {
    const res = await request(app)
      .post("/api/contact")
      .send({ ...validPayload, message: "hi" });

    expect(res.status).toBe(400);
    expect(sendContactEmail).not.toHaveBeenCalled();
  });

  it("rejects filled honeypot as spam", async () => {
    const res = await request(app)
      .post("/api/contact")
      .send({ ...validPayload, website: "http://spam.example" });

    expect(res.status).toBe(400);
    expect(sendContactEmail).not.toHaveBeenCalled();
  });
});
