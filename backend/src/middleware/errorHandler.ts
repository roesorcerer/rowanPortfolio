import { Request, Response, NextFunction } from "express";
import config from "../config";
import { ApiResponse } from "../types";

// Express identifies error-handling middleware by the 4-parameter signature.
// This MUST have all 4 params even if `next` is unused — otherwise Express
// won't recognize it as an error handler.
export function errorHandler(
  err: Error & { status?: number },
  _req: Request,
  res: Response<ApiResponse>,
  _next: NextFunction
): void {
  const status = err.status || 500;

  console.error(`[ERROR] ${status} - ${err.message}`);

  // In production, never leak stack traces or internal error details
  res.status(status).json({
    success: false,
    error: config.isProduction ? "Internal server error" : err.message,
  });
}
