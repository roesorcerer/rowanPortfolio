import * as contactSubmissionsStore from "../stores/contact-submissions-store";
import type { ContactSubmission } from "../stores/contact-submissions-store";
import { sendContactEmail } from "../services/mailer.service";

export type SubmitContactResult =
  | { kind: "ok"; submission: ContactSubmission }
  | { kind: "persisted-mailer-failed"; submission: ContactSubmission };

// Persist first so a downstream mailer outage never costs us the message.
// Mailer failures (misconfig or transport down) surface as a distinct
// Result kind so the controller can tell the visitor that we received
// the message even though delivery is delayed.
export async function submitContact(input: {
  name: string;
  email: string;
  subject?: string;
  message: string;
}): Promise<SubmitContactResult> {
  const submission = await contactSubmissionsStore.insert(input);

  try {
    await sendContactEmail(input);
  } catch (error) {
    console.error(
      "[contact-operations] mailer failed for submission",
      submission._id,
      error
    );
    return { kind: "persisted-mailer-failed", submission };
  }

  return { kind: "ok", submission };
}
