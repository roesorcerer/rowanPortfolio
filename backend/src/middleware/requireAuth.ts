import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/auth.utils";
import { ApiResponse } from "../types";

// Extracts and verifies the JWT from the Authorization header.
// If valid, attaches { adminId } to req.admin for downstream controllers.
//
// Signed in means admin: the only account that can exist is the one
// `npm run admin` creates, so there is no separate role check. A
// requireAdmin middleware used to follow this one and compare a role that
// could only ever be "admin"; it went with the role.
//
// Usage in routes:
//   router.delete("/:id", requireAuth, myController);
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
    req.admin = { adminId: payload.adminId };
    next();
  } catch {
    res.status(401).json({
      success: false,
      error: "Invalid or expired token",
    });
  }
}
