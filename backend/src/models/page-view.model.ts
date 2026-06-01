import mongoose, { Schema, Document } from "mongoose";
import { LIMITS } from "../validators/limits";

export interface IPageView extends Document {
  path: string;       // e.g. "/", "/admin/login"
  referrer: string;   // where the visitor came from
  userAgent: string;  // browser/device string
  createdAt: Date;
  updatedAt: Date;
}

const pageViewSchema = new Schema<IPageView>(
  {
    path: {
      type: String,
      required: true,
      trim: true,
      maxlength: LIMITS.tracking.pathMax,
    },
    referrer: {
      type: String,
      default: "",
      trim: true,
      maxlength: LIMITS.tracking.referrerMax,
    },
    userAgent: {
      type: String,
      default: "",
      trim: true,
      maxlength: LIMITS.tracking.userAgentMax,
    },
  },
  { timestamps: true }
);

// Indexes for the most common analytics queries.
pageViewSchema.index({ createdAt: -1 });
pageViewSchema.index({ path: 1, createdAt: -1 });

export const PageViewModel = mongoose.model<IPageView>("PageView", pageViewSchema);
