import {
  hashPassword,
  verifyPassword,
  signToken,
  verifyToken,
} from "./auth.utils";

describe("Password hashing", () => {
  it("hashes a password and verifies it correctly", async () => {
    const password = "testPassword123";
    const hash = await hashPassword(password);

    // Hash should not be the original password
    expect(hash).not.toBe(password);
    // Hash should be an Argon2 hash string
    expect(hash).toMatch(/^\$argon2/);

    // Correct password should verify
    expect(await verifyPassword(hash, password)).toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("correctPassword");
    expect(await verifyPassword(hash, "wrongPassword")).toBe(false);
  });

  it("produces different hashes for the same password (salting)", async () => {
    const password = "samePassword";
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);
    expect(hash1).not.toBe(hash2);
  });
});

describe("JWT sign and verify", () => {
  it("signs a token and verifies the payload", () => {
    const payload = { userId: "abc123", role: "admin" };
    const token = signToken(payload);

    // Token should be a JWT (three dot-separated base64 segments)
    expect(token.split(".")).toHaveLength(3);

    const decoded = verifyToken(token);
    expect(decoded.userId).toBe("abc123");
    expect(decoded.role).toBe("admin");
  });

  it("rejects a tampered token", () => {
    const token = signToken({ userId: "abc123", role: "user" });
    // Tamper with the payload section
    const tampered = token.slice(0, -5) + "XXXXX";

    expect(() => verifyToken(tampered)).toThrow();
  });

  it("rejects a completely invalid string", () => {
    expect(() => verifyToken("not.a.jwt")).toThrow();
  });
});
