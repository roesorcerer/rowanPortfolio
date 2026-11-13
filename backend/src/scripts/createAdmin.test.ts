import { beforeEach, describe, expect, it, vi } from "vitest";

const { connectMock, closeMock, findOneAndUpdateMock, hashPasswordMock } =
  vi.hoisted(() => ({
    connectMock: vi.fn(),
    closeMock: vi.fn(),
    findOneAndUpdateMock: vi.fn(),
    hashPasswordMock: vi.fn(),
  }));

vi.mock("mongoose", () => ({
  default: {
    connect: connectMock,
    connection: {
      close: closeMock,
    },
  },
}));

vi.mock("../models/admin.model", () => ({
  AdminModel: {
    findOneAndUpdate: findOneAndUpdateMock,
  },
}));

vi.mock("../utils/auth.utils", () => ({
  hashPassword: hashPasswordMock,
}));

import { createAdmin } from "./createAdmin";

describe("createAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.MONGODB_URI = "mongodb://localhost:27017/test";
    process.env.ADMIN_EMAIL = "Admin@Example.com";
    process.env.ADMIN_PASSWORD = "SuperSecret123!";
    process.env.ADMIN_NAME = "Test Admin";
  });

  it("creates or updates the admin from environment variables", async () => {
    hashPasswordMock.mockResolvedValue("hashed-password");
    findOneAndUpdateMock.mockResolvedValue({
      email: "admin@example.com",
      _id: "abc123",
    });

    await createAdmin();

    expect(connectMock).toHaveBeenCalledWith("mongodb://localhost:27017/test");
    expect(hashPasswordMock).toHaveBeenCalledWith("SuperSecret123!");
    expect(findOneAndUpdateMock).toHaveBeenCalledWith(
      { email: "admin@example.com" },
      {
        email: "admin@example.com",
        password: "hashed-password",
        name: "Test Admin",
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );
    expect(closeMock).toHaveBeenCalled();
  });

  it("refuses to run without a password, before touching the database", async () => {
    delete process.env.ADMIN_PASSWORD;

    await expect(createAdmin()).rejects.toThrow(
      "ADMIN_EMAIL and ADMIN_PASSWORD must both be set."
    );
    expect(connectMock).not.toHaveBeenCalled();
  });

  it("refuses a password shorter than the minimum", async () => {
    process.env.ADMIN_PASSWORD = "short";

    await expect(createAdmin()).rejects.toThrow(/at least 8 characters/);
    expect(connectMock).not.toHaveBeenCalled();
  });

  it("closes the connection even when the write fails", async () => {
    hashPasswordMock.mockResolvedValue("hashed-password");
    findOneAndUpdateMock.mockRejectedValue(new Error("write failed"));

    await expect(createAdmin()).rejects.toThrow("write failed");
    expect(closeMock).toHaveBeenCalled();
  });
});
