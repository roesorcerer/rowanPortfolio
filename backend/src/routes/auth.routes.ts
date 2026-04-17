import { Router } from "express";
import { register, login, getMe } from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import { requireAuth } from "../middleware/requireAuth";
import { registerSchema, loginSchema } from "../validators/auth.validators";

const router = Router();

// Public routes — no auth required
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);

// Protected route — requires valid JWT
router.get("/me", requireAuth, getMe);

export default router;
