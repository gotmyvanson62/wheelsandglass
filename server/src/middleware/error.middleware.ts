import type { Request, Response, NextFunction } from 'express';
import { ERROR_CODES } from 'shared';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

export function errorMiddleware(
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const code = err.code || ERROR_CODES.INTERNAL_ERROR;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
}

export function notFoundMiddleware(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: {
      code: ERROR_CODES.NOT_FOUND,
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
}
