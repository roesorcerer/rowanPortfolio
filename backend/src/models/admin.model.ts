import mongoose, { Schema, Document } from "mongoose";
import { LIMITS } from "../validators/limits";

// The one kind of account that can sign in. There used to be a User with a
// role of "admin" or "user", but a single-admin site has nobody else to be,
// and the "user" role could do nothing once registration was gone. Accounts
// come only from `npm run admin` (src/scripts/createAdmin.ts).
//
// The collection is `admins`. Existing data moved there from `users` with
// `npm run migrate:admins`, which also dropped the old role field.
export interface IAdmin extends Document {
  email: string;
  password: string; // Argon2 hash — never store plaintext
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const adminSchema = new Schema<IAdmin>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      // select: false means this field is excluded from queries by default.
      // You must explicitly call .select("+password") to include it.
      // This prevents accidentally leaking hashes in API responses.
      select: false,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [LIMITS.admin.nameMax, `Name cannot exceed ${LIMITS.admin.nameMax} characters`],
    },
  },
  {
    timestamps: true,
    // toJSON transform: strip password and __v from any JSON output.
    // Defense in depth — even if someone forgets select: false,
    // the password hash never appears in a response.
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// unique: true on the email field already creates an index,
// so no separate schema.index() call is needed.

export const AdminModel = mongoose.model<IAdmin>("Admin", adminSchema);
