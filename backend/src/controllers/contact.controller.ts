import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types";
import { ContactInput } from "../validators/contact.validators";
import { sendContactEmail } from "../services/mailer.service";
import { ContactSubmissionModel } from "../models/contact-submission.model";

// POST /api/contact
// Sends the visitor's message to the configured inbox.
// The body has already been validated by Zod middleware.
export async function submitContact(
  req: Request<unknown, unknown, ContactInput>,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const { name, email, subject, message } = req.body;

    // Persist to DB first so we never lose a message even if the mailer fails.
    await ContactSubmissionModel.create({ name, email, subject, message });

    await sendContactEmail({ name, email, subject, message });

    res.status(202).json({
      success: true,
      data: { message: "Message sent. Thanks for reaching out!" },
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/contact/submissions  (admin only)
export async function getContactSubmissions(
  _req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const submissions = await ContactSubmissionModel.find()
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    res.json({ success: true, data: submissions });
  } catch (error) {
    next(error);
  }
}
