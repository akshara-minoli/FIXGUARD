import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { AppError } from "../utils/app-error.js";

export function notFoundHandler(request, _response, next) { next(new AppError(`Route ${request.method} ${request.originalUrl} not found`, 404)); }
export function errorHandler(error, _request, response, _next) {
  if (error instanceof ZodError) return response.status(400).json({ success: false, message: "Validation failed", errors: error.issues.map((issue) => ({ field: issue.path.join(".") || "request", message: issue.message })) });
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") return response.status(404).json({ success: false, message: "Report not found" });
  if (error instanceof AppError && error.isOperational) return response.status(error.statusCode).json({ success: false, message: error.message });
  console.error("Unexpected request error:", error);
  return response.status(500).json({ success: false, message: "Internal server error" });
}
