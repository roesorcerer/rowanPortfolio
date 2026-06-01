import { ContactSubmissionModel } from "../models/contact-submission.model";

export type ContactSubmission = {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
};

type ContactSubmissionDoc = {
  _id: unknown;
  name: string;
  email: string;
  subject?: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
};

function toSubmission(doc: ContactSubmissionDoc): ContactSubmission {
  return {
    _id: String(doc._id),
    name: doc.name,
    email: doc.email,
    subject: doc.subject ?? "",
    message: doc.message,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function list({ limit }: { limit: number }): Promise<ContactSubmission[]> {
  const docs = await ContactSubmissionModel.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  return docs.map((d) => toSubmission(d as ContactSubmissionDoc));
}

export async function insert(input: {
  name: string;
  email: string;
  subject?: string;
  message: string;
}): Promise<ContactSubmission> {
  const doc = await ContactSubmissionModel.create({
    name: input.name,
    email: input.email,
    subject: input.subject ?? "",
    message: input.message,
  });
  return toSubmission(doc.toObject() as ContactSubmissionDoc);
}
