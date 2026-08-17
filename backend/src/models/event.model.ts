import mongoose, { Schema, Document } from "mongoose";
import { LIMITS } from "../validators/limits";

// Named interaction events fired by the frontend (non-pageview).
// e.g. project_view, link_click
export interface IEvent extends Document {
  eventType: string;       // "project_view" | "link_click"
  projectId?: string;      // MongoDB ObjectId string, if applicable
  projectTitle?: string;
  // Free string on purpose: historical rows keep whatever the taxonomy was
  // when the event fired (including the retired "featured" type).
  projectType?: string;    // "product" | "research" | "practice" | "gameDev" | "art"
  linkType?: string;       // "demo" | "github"
  referrer: string;
  userAgent: string;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    eventType: {
      type: String,
      required: true,
      trim: true,
      maxlength: LIMITS.event.typeMax,
    },
    projectId: {
      type: String,
      default: "",
      trim: true,
      maxlength: LIMITS.event.projectIdMax,
    },
    projectTitle: {
      type: String,
      default: "",
      trim: true,
      maxlength: LIMITS.event.projectTitleMax,
    },
    projectType: {
      type: String,
      default: "",
      trim: true,
      maxlength: LIMITS.event.projectTypeMax,
    },
    linkType: {
      type: String,
      default: "",
      trim: true,
      maxlength: LIMITS.event.linkTypeMax,
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

eventSchema.index({ eventType: 1, createdAt: -1 });
eventSchema.index({ projectId: 1, eventType: 1 });

export const EventModel = mongoose.model<IEvent>("Event", eventSchema);
