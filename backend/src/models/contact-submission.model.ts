import mongoose, { Schema, Document } from "mongoose";

export interface IContactSubmission extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

const contactSubmissionSchema = new Schema<IContactSubmission>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    subject: { type: String, default: "", trim: true },
    message: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

// Index for chronological queries in the admin dashboard.
contactSubmissionSchema.index({ createdAt: -1 });

export const ContactSubmissionModel = mongoose.model<IContactSubmission>(
  "ContactSubmission",
  contactSubmissionSchema
);
