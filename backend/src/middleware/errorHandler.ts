import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

// Simple API error wrapper
export class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "ValidationError",
      details: err.flatten(),
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Fallback
  // eslint-disable-next-line no-console
  console.error("Unhandled error", err);
  return res.status(500).json({ error: "Internal server error" });
}

