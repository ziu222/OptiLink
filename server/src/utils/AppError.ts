export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, code: string = 'ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  // ── Factory methods ──────────────────────────────────────

  static badRequest(message: string, code: string = 'BAD_REQUEST'): AppError {
    return new AppError(message, 400, code);
  }

  static unauthorized(message: string = 'Unauthorized', code: string = 'UNAUTHORIZED'): AppError {
    return new AppError(message, 401, code);
  }

  static forbidden(message: string = 'Forbidden', code: string = 'FORBIDDEN'): AppError {
    return new AppError(message, 403, code);
  }

  static notFound(message: string = 'Resource not found', code: string = 'NOT_FOUND'): AppError {
    return new AppError(message, 404, code);
  }

  static conflict(message: string, code: string = 'CONFLICT'): AppError {
    return new AppError(message, 409, code);
  }

  static unprocessable(message: string, code: string = 'VALIDATION_ERROR'): AppError {
    return new AppError(message, 422, code);
  }

  static tooManyRequests(message: string = 'Too many requests, please try again later'): AppError {
    return new AppError(message, 429, 'RATE_LIMIT');
  }

  static internal(message: string = 'Internal server error'): AppError {
    return new AppError(message, 500, 'INTERNAL_ERROR');
  }
}
