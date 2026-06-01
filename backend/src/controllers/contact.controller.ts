import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types";
import { ContactInput } from "../validators/contact.validators";
import { submitContact as submitContactOp } from "../operations/contact-operations";

const COPY = {
  ok: "Message sent. Thanks for reaching out!",
  persistedMailerFailed: "Message received — I'll get back to you shortly.",
};

// POST /api/contact
// The visitor sees a 202 in both branches — their message is captured either
// way. The copy differs so they aren't told "delivered" when the mailer
// silently dropped the message.
export async function submitContact(
  req: Request<unknown, unknown, ContactInput>,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const result = await submitContactOp(req.body);
    const message =
      result.kind === "ok" ? COPY.ok : COPY.persistedMailerFailed;
    res.status(202).json({ success: true, data: { message } });
  } catch (error) {
    next(error);
  }
}
