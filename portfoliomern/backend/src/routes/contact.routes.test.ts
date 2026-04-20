import { vi } from "vitest";
import request from "supertest";

// Mock the mailer BEFORE importing the app so the route pulls in the mock.
const sendContactEmail = vi.fn();
vi.mock("../services/mailer.service", () => ({
  sendContactEmail: (...args: unknown[]) => sendContactEmail(...args),
}));

import app from "../app";

describe("POST /api/contact", () => {
  const validPayload = {
    name: "Ada Lovelace",
    email: "ada@example.com",
    message: "I'd love to chat about your HCI research.",
  };

  beforeEach(() => {
    sendContactEmail.mockReset();
    sendContactEmail.mockResolvedValue(undefined);
  });

  it("accepts a valid submission and calls the mailer", async () => {
    const res = await request(app).post("/api/contact").send(validPayload);

    expect(res.status).toBe(202);
    expect(res.body.success).toBe(true);
    expect(sendContactEmail).toHaveBeenCalledTimes(1);
    expect(sendContactEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Ada Lovelace",
        email: "ada@example.com",
        message: expect.stringContaining("HCI"),
      })
    );
  });

  it("rejects invalid email without calling the mailer", async () => {
    const res = await request(app)
      .post("/api/contact")
      .send({ ...validPayload, email: "nope" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(sendContactEmail).not.toHaveBeenCalled();
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

  it("returns 500 when the mailer throws", async () => {
    sendContactEmail.mockRejectedValueOnce(new Error("SMTP down"));

    const res = await request(app).post("/api/contact").send(validPayload);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});
