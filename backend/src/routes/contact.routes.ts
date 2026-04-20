import { Router } from "express";
import { submitContact } from "../controllers/contact.controller";
import { validate } from "../middleware/validate";
import { contactSchema } from "../validators/contact.validators";

const router = Router();

// Public endpoint: anyone can submit a contact message.
router.post("/", validate(contactSchema), submitContact);

export default router;
