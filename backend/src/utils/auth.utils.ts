import argon2 from "argon2";
import jwt from "jsonwebtoken";
import config from "../config";

// --- Password Hashing ---
// Argon2id is the recommended algorithm (OWASP, NIST).
// It's resistant to both GPU and side-channel attacks.
// bcrypt is fine too, but Argon2 is the modern choice.

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
  });
}

export async function verifyPassword(
  hash: string,
  password: string
): Promise<boolean> {
  return argon2.verify(hash, password);
}

// --- JWT ---
// We store minimal data in the token: just the admin's ID. There is no role
// to carry, because the only account that can exist is the admin.
// Never put sensitive data (email, password hash) in JWTs —
// they're base64-encoded, not encrypted. Anyone can decode them.

export interface JwtPayload {
  adminId: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as string & jwt.SignOptions["expiresIn"],
  });
}

// The signature proves we issued the token, not that it has today's shape.
// Tokens issued before the Admin model carried { userId, role } and are
// still validly signed until they expire, so the shape is checked here and
// an old token fails like any other bad one: a 401, and the admin signs in
// again. Without the check it would pass with adminId undefined.
export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, config.jwtSecret);
  if (
    typeof decoded !== "object" ||
    typeof decoded.adminId !== "string" ||
    decoded.adminId === ""
  ) {
    throw new Error("Token payload is not an admin session");
  }
  return { adminId: decoded.adminId };
}
