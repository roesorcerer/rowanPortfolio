import { loginSchema } from "./auth.validators";

describe("loginSchema", () => {
  it("accepts valid login data", () => {
    const result = loginSchema.parse({
      email: "test@example.com",
      password: "password123",
    });
    expect(result.email).toBe("test@example.com");
  });

  it("lowercases and trims email", () => {
    const result = loginSchema.parse({
      email: "  TEST@Example.COM  ",
      password: "password123",
    });
    expect(result.email).toBe("test@example.com");
  });

  it("rejects invalid email", () => {
    expect(() =>
      loginSchema.parse({ email: "not-an-email", password: "password123" })
    ).toThrow();
  });

  it("rejects missing password", () => {
    expect(() => loginSchema.parse({ email: "test@example.com" })).toThrow();
  });
});
