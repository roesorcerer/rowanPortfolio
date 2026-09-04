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

  // A 4xx describes something the caller did and can fix, so its message is
  // safe — and necessary — to return. Masking them made a rejected save read
  // as "Internal server error", which sends someone looking for a bug on the
  // wrong side of the wire. Only 5xx hides its details, because only a 5xx
  // can carry internals worth leaking.
  const isClientError = status >= 400 && status < 500;

  res.status(status).json({
    success: false,
    error:
      config.isProduction && !isClientError
        ? "Internal server error"
        : messageFor(err, status),
  });
}

/**
 * `express.json` rejects an oversized body with a bare "request entity too
 * large", which says nothing about what to do next. Everything else keeps the
 * message it was given.
 */
function messageFor(err: Error & { type?: string }, status: number): string {
  if (status === 413) {
    return (
      "This project is too large to save. That usually means an image was " +
      "pasted in as data rather than as a path — put the file in " +
      "frontend/public/assets and reference it as /assets/your-file.png."
    );
  }

  return err.message;
}
