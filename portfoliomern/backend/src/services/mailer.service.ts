import nodemailer, { Transporter } from "nodemailer";
import config from "../config";

// Lazy transporter: created on first use, then cached. Keeping it out of
// module scope means importing this file during tests (or before env vars
// are read) never attempts a connection.
let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (transporter) return transporter;

  if (!config.smtp.host || !config.smtp.user || !config.smtp.password) {
    throw new Error(
      "SMTP is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASSWORD."
    );
  }

  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.password,
    },
  });

  return transporter;
}

// Escape HTML-sensitive characters so a visitor's message can't inject
// markup into the email we send ourselves.
function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export interface ContactMessage {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export async function sendContactEmail(input: ContactMessage): Promise<void> {
  if (!config.contactEmail) {
    throw new Error("CONTACT_EMAIL is not configured.");
  }

  const subject = input.subject?.trim()
    ? `Portfolio contact: ${input.subject}`
    : `Portfolio contact from ${input.name}`;

  const plainText =
    `From: ${input.name} <${input.email}>\n` +
    (input.subject ? `Subject: ${input.subject}\n` : "") +
    `\n${input.message}\n`;

  const html =
    `<p><strong>From:</strong> ${escapeHtml(input.name)} &lt;${escapeHtml(input.email)}&gt;</p>` +
    (input.subject
      ? `<p><strong>Subject:</strong> ${escapeHtml(input.subject)}</p>`
      : "") +
    `<p style="white-space: pre-wrap;">${escapeHtml(input.message)}</p>`;

  await getTransporter().sendMail({
    from: config.smtp.from,
    to: config.contactEmail,
    replyTo: `${input.name} <${input.email}>`,
    subject,
    text: plainText,
    html,
  });
}
