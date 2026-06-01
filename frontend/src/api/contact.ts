import api from "./client";
import type {
  ContactPayload,
  ContactSubmission,
} from "../../../shared/contracts";

export type { ContactPayload, ContactSubmission };

export function sendContactMessage(
  payload: ContactPayload
): Promise<{ message: string }> {
  return api.post<{ message: string }>("/api/contact", payload);
}

// Admin-only read endpoint — protected by requireAuth on the backend.
export function getContactSubmissions(): Promise<ContactSubmission[]> {
  return api.get<ContactSubmission[]>("/api/contact/submissions");
}
