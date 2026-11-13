import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import mongoose from "mongoose";
import { AdminModel } from "../models/admin.model";
import { hashPassword } from "../utils/auth.utils";
import { LIMITS } from "../validators/limits";

// Creates (or refreshes) the admin from env vars. This is the only way an
// account comes into being: public registration was removed, because a
// single-admin site has nobody else to register.
//
// Idempotent — if an admin with the given email already exists, its password
// and name are reset.
//
// Required env vars (in backend/.env or shell):
//   ADMIN_EMAIL=you@example.com
//   ADMIN_PASSWORD=somethingLongAndStrong
//   ADMIN_NAME=Rowan Stratton
//   MONGODB_URI=mongodb://...
//
// Run from the backend/ directory:
//   npm run admin

// A command now, not a startup step, so a missing or short value is an error
// that stops the run with a non-zero exit. When this also ran on every boot,
// the same checks had to warn and carry on, so the server could start
// without them; that is why they used to say "Skipping".
export async function createAdmin(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? "Admin";

  if (!mongoUri) throw new Error("MONGODB_URI is not set.");
  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must both be set.");
  }
  if (password.length < LIMITS.admin.passwordMin) {
    throw new Error(
      `ADMIN_PASSWORD must be at least ${LIMITS.admin.passwordMin} characters.`
    );
  }

  await mongoose.connect(mongoUri);
  try {
    const hashed = await hashPassword(password);
    const lowerEmail = email.trim().toLowerCase();

    const result = await AdminModel.findOneAndUpdate(
      { email: lowerEmail },
      { email: lowerEmail, password: hashed, name },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );

    console.log(`Admin ready: ${result.email} (${result._id})`);
  } finally {
    await mongoose.connection.close();
  }
}

if (require.main === module) {
  createAdmin().catch((error: unknown) => {
    console.error(
      "npm run admin failed:",
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  });
}
