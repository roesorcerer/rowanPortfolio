import { Router } from "express";
import { submitContact } from "../controllers/contact.controller";
import { validate } from "../middleware/validate";
import { contactSchema } from "../validators/contact.validators";
import { requireAuth, requireAdmin } from "../middleware/requireAuth";
import { respond } from "./respond";
import * as contactSubmissionsStore from "../stores/contact-submissions-store";

const router = Router();

// Public endpoint: anyone can submit a contact message.
router.post("/", validate(contactSchema), submitContact);

// Admin only: view all contact form submissions.
router.get(
  "/submissions",
  requireAuth,
  requireAdmin,
  respond(() => contactSubmissionsStore.list({ limit: 200 }))
);

export default router;
