/**
 * Standardized API Response Utilities
 * Provides consistent response formats across all API endpoints
 */

/**
 * Standard success response
 */
export interface SuccessResponse<T = unknown> {
  success: true;
  data?: T;
  message?: string;
  meta?: {
    total?: number;
    limit?: number;
    offset?: number;
    [key: string]: unknown;
  };
}

/**
 * Standard error response
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Combined API response type
 */
export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

/**
 * Create a success response
 */
export function successResponse<T>(
  data?: T,
  message?: string,
  meta?: SuccessResponse['meta']
): SuccessResponse<T> {
  const response: SuccessResponse<T> = { success: true };
  if (data !== undefined) response.data = data;
  if (message) response.message = message;
  if (meta) response.meta = meta;
  return response;
}

/**
 * Create an error response
 */
export function errorResponse(
  code: string,
  message: string,
  details?: unknown
): ErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined && { details })
    }
  };
}

/**
 * Common error codes
 */
export const ErrorCodes = {
  // Client errors (4xx)
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  CONFLICT: 'CONFLICT',

  // Server errors (5xx)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR'
} as const;

/**
 * Pre-built common error responses
 */
export const CommonErrors = {
  notFound: (resource: string = 'Resource') =>
    errorResponse(ErrorCodes.NOT_FOUND, `${resource} not found`),

  badRequest: (message: string = 'Invalid request') =>
    errorResponse(ErrorCodes.BAD_REQUEST, message),

  unauthorized: () =>
    errorResponse(ErrorCodes.UNAUTHORIZED, 'Authentication required'),

  forbidden: () =>
    errorResponse(ErrorCodes.FORBIDDEN, 'You do not have permission to access this resource'),

  validationError: (details: unknown) =>
    errorResponse(ErrorCodes.VALIDATION_ERROR, 'Validation failed', details),

  internalError: (message: string = 'An unexpected error occurred') =>
    errorResponse(ErrorCodes.INTERNAL_ERROR, message),

  serviceUnavailable: (service: string = 'Service') =>
    errorResponse(ErrorCodes.SERVICE_UNAVAILABLE, `${service} is temporarily unavailable`)
} as const;

/**
 * HTTP status codes mapped to error codes
 */
export function getHttpStatus(code: string): number {
  switch (code) {
    case ErrorCodes.BAD_REQUEST:
    case ErrorCodes.VALIDATION_ERROR:
      return 400;
    case ErrorCodes.UNAUTHORIZED:
      return 401;
    case ErrorCodes.FORBIDDEN:
      return 403;
    case ErrorCodes.NOT_FOUND:
      return 404;
    case ErrorCodes.CONFLICT:
      return 409;
    case ErrorCodes.SERVICE_UNAVAILABLE:
      return 503;
    case ErrorCodes.INTERNAL_ERROR:
    case ErrorCodes.DATABASE_ERROR:
    case ErrorCodes.EXTERNAL_SERVICE_ERROR:
    default:
      return 500;
  }
}
