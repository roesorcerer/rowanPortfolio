import { Request, Response } from "express";
import { ApiResponse } from "../types";

// Health check endpoint — used by load balancers, Docker health checks,
// and monitoring tools to verify the server is alive.
export function getHealth(_req: Request, res: Response<ApiResponse<{ uptime: number }>>): void {
  res.json({
    success: true,
    data: {
      uptime: process.uptime(),
    },
  });
}
