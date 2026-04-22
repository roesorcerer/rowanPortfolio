import { Router } from "express";
import { submitContact, getContactSubmissions } from "../controllers/contact.controller";
import { validate } from "../middleware/validate";
import { contactSchema } from "../validators/contact.validators";
import { requireAuth, requireAdmin } from "../middleware/requireAuth";

const router = Router();

// Public endpoint: anyone can submit a contact message.
router.post("/", validate(contactSchema), submitContact);

// Admin only: view all contact form submissions.
router.get("/submissions", requireAuth, requireAdmin, getContactSubmissions);

export default router;
