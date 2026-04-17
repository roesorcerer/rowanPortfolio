import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/auth.utils";
import { ApiResponse } from "../types";

// Extracts and verifies the JWT from the Authorization header.
// If valid, attaches the decoded payload to req.user so downstream
// controllers can access userId and role.
//
// Usage in routes:
//   router.post("/", requireAuth, myController);        // any authenticated user
//   router.delete("/:id", requireAuth, requireAdmin, myController); // admin only
export function requireAuth(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      error: "Authentication required",
    });
    return;
  }

  const token = header.split(" ")[1];

  try {
    const payload = verifyToken(token);
    req.user = { userId: payload.userId, role: payload.role };
    next();
  } catch {
    res.status(401).json({
      success: false,
      error: "Invalid or expired token",
    });
  }
}

// Checks that the authenticated user has the admin role.
// Must be used AFTER requireAuth in the middleware chain.
export function requireAdmin(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): void {
  if (req.user?.role !== "admin") {
    res.status(403).json({
      success: false,
      error: "Admin access required",
    });
    return;
  }
  next();
}
