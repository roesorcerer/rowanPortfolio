import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/auth.utils";
import { readSessionCookie } from "../utils/session-cookie";
import { ApiResponse } from "../types";

// Verifies the JWT in the session cookie (utils/session-cookie.ts) and, if
// it holds, attaches { adminId } to req.admin for downstream controllers.
//
// The Authorization header is deliberately not read any more. Accepting a
// Bearer token as well would keep alive the path the cookie exists to close:
// a token that JavaScript can hold is a token an injected script can steal.
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
  const token = readSessionCookie(req);

  if (!token) {
    res.status(401).json({
      success: false,
      error: "Authentication required",
    });
    return;
  }

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
