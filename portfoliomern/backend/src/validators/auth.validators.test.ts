import { registerSchema, loginSchema } from "./auth.validators";

describe("registerSchema", () => {
  const validData = {
    email: "test@example.com",
    password: "password123",
    name: "Test User",
  };

  it("accepts valid registration data", () => {
    const result = registerSchema.parse(validData);
    expect(result.email).toBe("test@example.com");
    expect(result.name).toBe("Test User");
  });

  it("lowercases and trims email", () => {
    const result = registerSchema.parse({
      ...validData,
      email: "  TEST@Example.COM  ",
    });
    expect(result.email).toBe("test@example.com");
  });

  it("rejects invalid email", () => {
    expect(() =>
      registerSchema.parse({ ...validData, email: "not-an-email" })
    ).toThrow();
  });

  it("rejects short password", () => {
    expect(() =>
      registerSchema.parse({ ...validData, password: "short" })
    ).toThrow();
  });

  it("rejects missing name", () => {
    expect(() =>
      registerSchema.parse({ email: "a@b.com", password: "password123" })
    ).toThrow();
  });

  it("trims name", () => {
    const result = registerSchema.parse({
      ...validData,
      name: "  Rowan  ",
    });
    expect(result.name).toBe("Rowan");
  });
});

describe("loginSchema", () => {
  it("accepts valid login data", () => {
    const result = loginSchema.parse({
      email: "test@example.com",
      password: "password123",
    });
    expect(result.email).toBe("test@example.com");
  });

  it("rejects missing password", () => {
    expect(() =>
      loginSchema.parse({ email: "test@example.com" })
    ).toThrow();
  });
});
