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

export async function createAdmin(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? "Admin";
  const shouldManageConnection = mongoose.connection.readyState === 0;

  if (shouldManageConnection && !mongoUri) {
    console.warn("Skipping admin bootstrap: MONGODB_URI is not set.");
    return;
  }
  if (!email || !password) {
    console.warn(
      "Skipping admin bootstrap: ADMIN_EMAIL and ADMIN_PASSWORD must both be set."
    );
    return;
  }
  if (password.length < LIMITS.admin.passwordMin) {
    console.warn(
      `Skipping admin bootstrap: ADMIN_PASSWORD must be at least ${LIMITS.admin.passwordMin} characters.`
    );
    return;
  }

  try {
    if (shouldManageConnection) {
      await mongoose.connect(mongoUri as string);
      console.log("Connected to MongoDB.");
    }

    const hashed = await hashPassword(password);
    const lowerEmail = email.trim().toLowerCase();

    const result = await AdminModel.findOneAndUpdate(
      { email: lowerEmail },
      { email: lowerEmail, password: hashed, name },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );

    console.log(`Admin ready: ${result.email} (${result._id})`);
  } catch (error) {
    console.error("createAdmin failed:", error);
  } finally {
    if (shouldManageConnection) {
      await mongoose.connection.close();
      console.log("Done.");
    }
  }
}

if (require.main === module) {
  void createAdmin();
}
