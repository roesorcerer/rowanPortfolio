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

vi.mock("../models/user.model", () => ({
  UserModel: {
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

  it("creates or updates the admin user from environment variables", async () => {
    hashPasswordMock.mockResolvedValue("hashed-password");
    findOneAndUpdateMock.mockResolvedValue({
      email: "admin@example.com",
      _id: "abc123",
      role: "admin",
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
        role: "admin",
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    expect(closeMock).toHaveBeenCalled();
  });
});
