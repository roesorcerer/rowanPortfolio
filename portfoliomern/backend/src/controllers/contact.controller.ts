import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types";
import { ContactInput } from "../validators/contact.validators";
import { sendContactEmail } from "../services/mailer.service";

// POST /api/contact
// Sends the visitor's message to the configured inbox.
// The body has already been validated by Zod middleware.
export async function submitContact(
  req: Request<unknown, unknown, ContactInput>,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    // Honeypot is present (and empty) on legitimate submissions. If a bot
    // fills it, validation already rejected the request — so by this point
    // we can safely ignore the field and pass only real content to the mailer.
    const { name, email, subject, message } = req.body;

    await sendContactEmail({ name, email, subject, message });

    res.status(202).json({
      success: true,
      data: { message: "Message sent. Thanks for reaching out!" },
    });
  } catch (error) {
    next(error);
  }
}
