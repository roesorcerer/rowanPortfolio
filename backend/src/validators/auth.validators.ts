import { z } from "zod";

export const registerSchema = z.object({
  email: z
    .string({ error: "Email is required" })
    .trim()
    .toLowerCase()
    .email("Invalid email format"),
  password: z
    .string({ error: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password cannot exceed 128 characters"),
  name: z
    .string({ error: "Name is required" })
    .min(1, "Name is required")
    .max(100, "Name cannot exceed 100 characters")
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

// Infer TypeScript types from the schemas.
// This is the key Zod pattern: define once, get both
// runtime validation AND compile-time types.
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
