import mongoose, { Schema, Document } from "mongoose";
import { LIMITS } from "../validators/limits";

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
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [LIMITS.contact.nameMax, `Name cannot exceed ${LIMITS.contact.nameMax} characters`],
    },
    email: { type: String, required: true, trim: true, lowercase: true },
    subject: {
      type: String,
      default: "",
      trim: true,
      maxlength: [
        LIMITS.contact.subjectMax,
        `Subject cannot exceed ${LIMITS.contact.subjectMax} characters`,
      ],
    },
    message: {
      type: String,
      required: true,
      trim: true,
      minlength: [
        LIMITS.contact.messageMin,
        `Message must be at least ${LIMITS.contact.messageMin} characters`,
      ],
      maxlength: [
        LIMITS.contact.messageMax,
        `Message cannot exceed ${LIMITS.contact.messageMax} characters`,
      ],
    },
  },
  { timestamps: true }
);

// Index for chronological queries in the admin dashboard.
contactSubmissionSchema.index({ createdAt: -1 });

export const ContactSubmissionModel = mongoose.model<IContactSubmission>(
  "ContactSubmission",
  contactSubmissionSchema
);
