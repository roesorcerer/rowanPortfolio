import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { ApiResponse } from "../types";

// Generic validation middleware factory.
// Usage: router.post("/", validate(mySchema), myController)
//
// This keeps validation logic OUT of controllers. Controllers
// can trust that req.body is already validated and typed.
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response<ApiResponse>, next: NextFunction): void => {
    try {
      // parse() throws if validation fails, returns typed data if it passes.
      // We reassign req.body so the controller gets the parsed (and potentially
      // transformed — trimmed strings, default values, etc.) version.
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod's error array into a readable string.
        // Each issue has a path (which field) and message (what's wrong).
        const message = error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join(", ");

        res.status(400).json({
          success: false,
          error: message,
        });
        return;
      }
      next(error);
    }
  };
}
