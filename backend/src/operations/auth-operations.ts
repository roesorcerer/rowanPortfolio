import * as adminsStore from "../stores/admins-store";
import type { Admin } from "../stores/admins-store";
import { verifyPassword, signToken } from "../utils/auth.utils";

type Issued = { admin: Admin; token: string };

export type AuthenticateResult =
  | ({ kind: "ok" } & Issued)
  | { kind: "invalid-credentials" };

function issue(admin: Admin): Issued {
  return { admin, token: signToken({ adminId: admin._id }) };
}

export async function authenticate(input: {
  email: string;
  password: string;
}): Promise<AuthenticateResult> {
  const found = await adminsStore.findByEmail(input.email, {
    withPassword: true,
  });

  // Same outcome for "no such admin" and "wrong password" to prevent
  // email enumeration.
  if (!found || !(await verifyPassword(found.password, input.password))) {
    return { kind: "invalid-credentials" };
  }

  const { password: _hash, ...admin } = found;
  return { kind: "ok", ...issue(admin) };
}
