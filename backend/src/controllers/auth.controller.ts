import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types";
import { LoginInput } from "../validators/auth.validators";
import * as adminsStore from "../stores/admins-store";
import { authenticate } from "../operations/auth-operations";

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
      data: { token: result.token, admin: result.admin },
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
    const admin = await adminsStore.findById(req.admin!.adminId);
    if (!admin) {
      res.status(404).json({ success: false, error: "Admin not found" });
      return;
    }
    res.json({ success: true, data: { admin } });
  } catch (error) {
    next(error);
  }
}
