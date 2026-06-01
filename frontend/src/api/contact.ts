import api from "./client";

export interface ContactPayload {
  name: string;
  email: string;
  subject?: string;
  message: string;
  // Honeypot: hidden input that real users leave empty. Included in the
  // type so the form can post it; the backend rejects any non-empty value.
  website?: string;
}

export interface ContactSubmission {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

export function sendContactMessage(
  payload: ContactPayload
): Promise<{ message: string }> {
  return api.post<{ message: string }>("/api/contact", payload);
}

// Admin-only read endpoint — protected by requireAuth on the backend.
export function getContactSubmissions(): Promise<ContactSubmission[]> {
  return api.get<ContactSubmission[]>("/api/contact/submissions");
}
