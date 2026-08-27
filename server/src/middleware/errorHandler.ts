import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';
import mongoose from 'mongoose';
import { ZodError } from 'zod';

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Formats Zod validation errors into a readable structure.
 */
const formatZodErrors = (err: ZodError) => {
  return err.errors.map((e) => ({
    field: e.path.join('.'),
    message: e.message,
  }));
};

/**
 * Global error handling middleware.
 * Must be registered LAST (after all routes).
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'Internal server error';
  let details: unknown = undefined;

  // ── 1. AppError (our custom errors) ──────────────────
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
  }

  // ── 2. Zod Validation Error ──────────────────────────
  else if (err instanceof ZodError) {
    statusCode = 422;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    details = formatZodErrors(err);
  }

  // ── 3. Mongoose Validation Error ─────────────────────
  else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 422;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // ── 4. Mongoose CastError (invalid ObjectId) ────────
  else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    code = 'INVALID_ID';
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // ── 5. Mongoose Duplicate Key (code 11000) ──────────
  else if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    statusCode = 409;
    code = 'DUPLICATE_KEY';
    const field = Object.keys((err as any).keyPattern)[0];
    message = `${field} already exists`;
  }

  // ── 6. JWT Errors ───────────────────────────────────
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'INVALID_TOKEN';
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Token has expired';
  }

  // ── 7. Unknown errors ──────────────────────────────
  else {
    logger.error('Unhandled error:', err);
  }

  // Log server errors
  if (statusCode >= 500) {
    logger.error(`[${code}] ${message}`, { stack: err.stack });
  }

  const response: ErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  };

  // Don't leak stack traces in production
  if (process.env.NODE_ENV === 'development' && statusCode >= 500) {
    (response.error as any).stack = err.stack;
  }

  res.status(statusCode).json(response);
};
