import mongoose, { Schema, Document } from "mongoose";

// Named interaction events fired by the frontend (non-pageview).
// e.g. project_view, link_click
export interface IEvent extends Document {
  eventType: string;       // "project_view" | "link_click"
  projectId?: string;      // MongoDB ObjectId string, if applicable
  projectTitle?: string;
  projectType?: string;    // "featured" | "research" | "practice"
  linkType?: string;       // "demo" | "github"
  referrer: string;
  userAgent: string;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    eventType:    { type: String, required: true, trim: true },
    projectId:    { type: String, default: "", trim: true },
    projectTitle: { type: String, default: "", trim: true },
    projectType:  { type: String, default: "", trim: true },
    linkType:     { type: String, default: "", trim: true },
    referrer:     { type: String, default: "", trim: true },
    userAgent:    { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

eventSchema.index({ eventType: 1, createdAt: -1 });
eventSchema.index({ projectId: 1, eventType: 1 });

export const EventModel = mongoose.model<IEvent>("Event", eventSchema);
