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
// We store minimal data in the token: just the user ID and role.
// Never put sensitive data (email, password hash) in JWTs —
// they're base64-encoded, not encrypted. Anyone can decode them.

export interface JwtPayload {
  userId: string;
  role: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as string & jwt.SignOptions["expiresIn"],
  });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwtSecret) as JwtPayload;
}
