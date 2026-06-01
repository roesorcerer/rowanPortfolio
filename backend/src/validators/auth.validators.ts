import { z } from "zod";
import { LIMITS } from "./limits";

export const registerSchema = z.object({
  email: z
    .string({ error: "Email is required" })
    .trim()
    .toLowerCase()
    .email("Invalid email format"),
  password: z
    .string({ error: "Password is required" })
    .min(LIMITS.user.passwordMin, `Password must be at least ${LIMITS.user.passwordMin} characters`)
    .max(LIMITS.user.passwordMax, `Password cannot exceed ${LIMITS.user.passwordMax} characters`),
  name: z
    .string({ error: "Name is required" })
    .min(1, "Name is required")
    .max(LIMITS.user.nameMax, `Name cannot exceed ${LIMITS.user.nameMax} characters`)
    .trim(),
});

export const loginSchema = z.object({
  email: z
    .string({ error: "Email is required" })
    .trim()
    .toLowerCase()
    .email("Invalid email format"),
  password: z
    .string({ error: "Password is required" })
    .min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
