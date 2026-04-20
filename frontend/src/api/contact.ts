import api from "./client";
import type { ApiResponse } from "../types";

export interface ContactPayload {
  name: string;
  email: string;
  subject?: string;
  message: string;
  // Honeypot: hidden input that real users leave empty. Included in the
  // type so the form can post it; the backend rejects any non-empty value.
  website?: string;
}

export async function sendContactMessage(
  payload: ContactPayload
): Promise<{ message: string }> {
  const { data } = await api.post<ApiResponse<{ message: string }>>(
    "/api/contact",
    payload
  );
  return data.data!;
}
