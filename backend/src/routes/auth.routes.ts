import { Router } from "express";
import { login, getMe } from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import { requireAuth } from "../middleware/requireAuth";
import { loginSchema } from "../validators/auth.validators";
import { loginLimiters } from "../middleware/rateLimit";

const router = Router();

// Public — no auth required. There is deliberately no /register: the only
// account is the admin, created by `npm run admin` (src/scripts/createAdmin.ts).
// Anyone could sign up while it existed; a "user" role could do nothing, but
// it was still an open write into the users collection.
//
// The limiters run before validation so malformed attempts count too.
router.post("/login", ...loginLimiters, validate(loginSchema), login);

// Protected route — requires valid JWT
router.get("/me", requireAuth, getMe);

export default router;
