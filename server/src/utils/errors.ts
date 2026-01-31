/**
 * Custom Error Classes for Production Error Handling
 * Provides consistent error structure across the application
 */

export enum ErrorCode {
  // Authentication Errors (401)
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',

  // Authorization Errors (403)
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',

  // Validation Errors (400)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_FIELD = 'MISSING_FIELD',

  // Not Found Errors (404)
  NOT_FOUND = 'NOT_FOUND',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',

  // Conflict Errors (409)
  CONFLICT = 'CONFLICT',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',

  // External Service Errors (502)
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  SQUARE_API_ERROR = 'SQUARE_API_ERROR',
  QUO_API_ERROR = 'QUO_API_ERROR',
  OMEGA_API_ERROR = 'OMEGA_API_ERROR',

  // Database Errors (503)
  DATABASE_ERROR = 'DATABASE_ERROR',
  CONNECTION_ERROR = 'CONNECTION_ERROR',

  // Internal Errors (500)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  UNEXPECTED_ERROR = 'UNEXPECTED_ERROR',
}

export interface ErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: unknown;
    stack?: string;
  };
}

/**
 * Base application error class
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number = 500,
    details?: unknown,
    isOperational: boolean = true
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  toResponse(includeStack: boolean = false): ErrorResponse {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
        stack: includeStack ? this.stack : undefined,
      },
    };
  }
}

/**
 * Authentication error (401)
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required', code: ErrorCode = ErrorCode.UNAUTHORIZED) {
    super(code, message, 401);
  }
}

/**
 * Authorization error (403)
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied', code: ErrorCode = ErrorCode.FORBIDDEN) {
    super(code, message, 403);
  }
}

/**
 * Validation error (400)
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(ErrorCode.VALIDATION_ERROR, message, 400, details);
  }
}

/**
 * Not found error (404)
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(ErrorCode.NOT_FOUND, `${resource} not found`, 404);
  }
}

/**
 * Conflict error (409)
 */
export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super(ErrorCode.CONFLICT, message, 409, details);
  }
}

/**
 * External service error (502)
 */
export class ExternalServiceError extends AppError {
  constructor(service: string, message: string, details?: unknown) {
    super(ErrorCode.EXTERNAL_SERVICE_ERROR, `${service}: ${message}`, 502, details);
  }
}

/**
 * Database error (503)
 */
export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed', details?: unknown) {
    super(ErrorCode.DATABASE_ERROR, message, 503, details, false);
  }
}

/**
 * Check if an error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Convert any error to an AppError
 */
export function toAppError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(
      ErrorCode.INTERNAL_ERROR,
      error.message,
      500,
      undefined,
      false
    );
  }

  return new AppError(
    ErrorCode.UNEXPECTED_ERROR,
    'An unexpected error occurred',
    500,
    undefined,
    false
  );
}

/**
 * Express error handler middleware
 */
export function errorHandler(
  err: unknown,
  req: import('express').Request,
  res: import('express').Response,
  next: import('express').NextFunction
): void {
  const appError = toAppError(err);
  const isDev = process.env.NODE_ENV !== 'production';

  // Log error
  if (!appError.isOperational || appError.statusCode >= 500) {
    console.error('[ERROR]', {
      code: appError.code,
      message: appError.message,
      stack: appError.stack,
      path: req.path,
      method: req.method,
    });
  }

  res.status(appError.statusCode).json(appError.toResponse(isDev));
}

/**
 * Async route handler wrapper
 * Catches async errors and forwards to error handler
 */
export function asyncHandler(
  fn: (req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => Promise<unknown>
) {
  return (req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
