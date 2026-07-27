import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import mongoose from "mongoose";
import { UserModel } from "../models/user.model";
import { hashPassword } from "../utils/auth.utils";

// Creates (or refreshes) an admin user from env vars. Idempotent — if a
// user with the given email already exists, the password is reset and
// the role is promoted to "admin".
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

  if (!mongoUri) {
    console.warn("Skipping admin bootstrap: MONGODB_URI is not set.");
    return;
  }
  if (!email || !password) {
    console.warn(
      "Skipping admin bootstrap: ADMIN_EMAIL and ADMIN_PASSWORD must both be set."
    );
    return;
  }
  if (password.length < 8) {
    console.warn("Skipping admin bootstrap: ADMIN_PASSWORD must be at least 8 characters.");
    return;
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB.");

    const hashed = await hashPassword(password);
    const lowerEmail = email.trim().toLowerCase();

    const result = await UserModel.findOneAndUpdate(
      { email: lowerEmail },
      { email: lowerEmail, password: hashed, name, role: "admin" },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`Admin user ready: ${result.email} (${result._id})`);
  } catch (error) {
    console.error("createAdmin failed:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Done.");
  }
}

if (require.main === module) {
  void createAdmin();
}
