import * as usersStore from "../stores/users-store";
import type { User } from "../stores/users-store";
import { hashPassword, verifyPassword, signToken } from "../utils/auth.utils";

type Issued = { user: User; token: string };

export type RegisterResult =
  | ({ kind: "ok" } & Issued)
  | { kind: "duplicate-email" };

export type AuthenticateResult =
  | ({ kind: "ok" } & Issued)
  | { kind: "invalid-credentials" };

function issue(user: User): Issued {
  return {
    user,
    token: signToken({ userId: user._id, role: user.role }),
  };
}

export async function registerUser(input: {
  email: string;
  password: string;
  name: string;
}): Promise<RegisterResult> {
  const existing = await usersStore.findByEmail(input.email);
  if (existing) return { kind: "duplicate-email" };

  const hashed = await hashPassword(input.password);
  const user = await usersStore.create({
    email: input.email,
    password: hashed,
    name: input.name,
  });

  return { kind: "ok", ...issue(user) };
}

export async function authenticate(input: {
  email: string;
  password: string;
}): Promise<AuthenticateResult> {
  const found = await usersStore.findByEmail(input.email, { withPassword: true });

  // Same outcome for "no such user" and "wrong password" to prevent
  // email enumeration.
  if (!found || !(await verifyPassword(found.password, input.password))) {
    return { kind: "invalid-credentials" };
  }

  const { password: _hash, ...user } = found;
  return { kind: "ok", ...issue(user) };
}
