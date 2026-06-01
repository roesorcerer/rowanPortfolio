import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types";
import { RegisterInput, LoginInput } from "../validators/auth.validators";
import * as usersStore from "../stores/users-store";
import { registerUser, authenticate } from "../operations/auth-operations";

// POST /api/auth/register
export async function register(
  req: Request<unknown, unknown, RegisterInput>,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const result = await registerUser(req.body);
    if (result.kind === "duplicate-email") {
      res.status(409).json({ success: false, error: "Email already registered" });
      return;
    }
    res.status(201).json({
      success: true,
      data: { token: result.token, user: result.user },
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/auth/login
export async function login(
  req: Request<unknown, unknown, LoginInput>,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const result = await authenticate(req.body);
    if (result.kind === "invalid-credentials") {
      res.status(401).json({ success: false, error: "Invalid email or password" });
      return;
    }
    res.json({
      success: true,
      data: { token: result.token, user: result.user },
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/auth/me
export async function getMe(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const user = await usersStore.findById(req.user!.userId);
    if (!user) {
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }
    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
}
