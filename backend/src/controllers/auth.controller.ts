import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types";
import { LoginInput } from "../validators/auth.validators";
import * as adminsStore from "../stores/admins-store";
import { authenticate } from "../operations/auth-operations";
import {
  setSessionCookie,
  clearSessionCookie,
} from "../utils/session-cookie";

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
    // The token goes only into the HttpOnly cookie. Returning it in the
    // body as well would hand it straight back to JavaScript.
    setSessionCookie(res, result.token);
    res.json({ success: true, data: { admin: result.admin } });
  } catch (error) {
    next(error);
  }
}

// POST /api/auth/logout
//
// The frontend can't clear an HttpOnly cookie itself, so signing out is a
// request. Public and idempotent: clearing a cookie that isn't there is
// fine, and an expired session should still be able to sign out. It doesn't
// revoke the token (there is no server-side session list), so a copy taken
// before logout stays valid until it expires; the cookie is what keeps one
// from being taken.
export function logout(_req: Request, res: Response): void {
  clearSessionCookie(res);
  res.status(204).end();
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
