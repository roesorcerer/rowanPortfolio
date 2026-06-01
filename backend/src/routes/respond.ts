import { Request, Response, NextFunction, RequestHandler } from "express";
import { ApiResponse } from "../types";

// Wraps an async producer into an Express handler that responds with the
// standard ApiResponse envelope and forwards errors to next().
export function respond<T>(
  producer: (req: Request) => Promise<T> | T,
  status = 200
): RequestHandler {
  return async (req: Request, res: Response<ApiResponse<T>>, next: NextFunction) => {
    try {
      const data = await producer(req);
      res.status(status).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };
}
