import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request to include user info
declare global {
  namespace Express {
    interface Request {
      user?: {
        username: string;
        role?: string;
        iat?: number;
        exp?: number;
      };
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET;

/**
 * Verify JWT token and attach user to request
 * Returns null if invalid, user payload if valid
 */
function verifyJWT(token: string, secret: string): object | null {
  try {
    return jwt.verify(token, secret) as object;
  } catch {
    return null;
  }
}

/**
 * Extract JWT token from various sources
 * Priority: Authorization header > Cookie > Query param
 */
function extractToken(req: Request): string | undefined {
  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check cookies
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    if (cookies['admin_token']) {
      return cookies['admin_token'];
    }
  }

  // Check query param (for webhook testing, etc.)
  if (typeof req.query.token === 'string') {
    return req.query.token;
  }

  return undefined;
}

/**
 * Authentication middleware for protected routes
 * Requires valid JWT token to proceed
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // Skip auth check if JWT_SECRET is not configured (development without auth)
  if (!JWT_SECRET) {
    console.warn('[AUTH] JWT_SECRET not configured - skipping authentication');
    return next();
  }

  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  const payload = verifyJWT(token, JWT_SECRET);

  if (!payload) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }

  // Attach user info to request
  req.user = payload as Request['user'];
  next();
}

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't require it
 */
export function optionalAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!JWT_SECRET) {
    return next();
  }

  const token = extractToken(req);

  if (token) {
    const payload = verifyJWT(token, JWT_SECRET);
    if (payload) {
      req.user = payload as Request['user'];
    }
  }

  next();
}

/**
 * Admin-only middleware
 * Requires authentication AND admin role
 */
export function adminOnlyMiddleware(req: Request, res: Response, next: NextFunction) {
  // First run auth middleware
  authMiddleware(req, res, () => {
    // If auth middleware called next (meaning user is authenticated)
    if (!req.user) {
      return; // Auth middleware already sent 401 response
    }

    // Check for admin role
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }

    next();
  });
}
