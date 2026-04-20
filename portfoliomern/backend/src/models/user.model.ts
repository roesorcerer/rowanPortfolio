import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string; // Argon2 hash — never store plaintext
  name: string;
  role: "admin" | "user";
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
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
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
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

export const UserModel = mongoose.model<IUser>("User", userSchema);
