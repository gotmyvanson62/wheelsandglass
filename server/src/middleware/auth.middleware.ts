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

// SECURITY: Require JWT_SECRET for authentication - no fallback to SESSION_SECRET
const JWT_SECRET = process.env.JWT_SECRET;

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

  // SECURITY: Token in query params removed - tokens in URLs can be logged and exposed
  // Use Authorization header or cookies instead

  return undefined;
}

/**
 * Authentication middleware for protected routes
 * Requires valid JWT token to proceed
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // SECURITY: Require JWT_SECRET - fail if not configured in production
  if (!JWT_SECRET) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[SECURITY] JWT_SECRET not configured in production - rejecting request');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error',
      });
    }
    console.warn('[AUTH] JWT_SECRET not configured - allowing request in development');
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
    if (process.env.NODE_ENV === 'production') {
      console.warn('[AUTH] JWT_SECRET not configured in production - optional auth skipped');
    }
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

/**
 * IDOR (Insecure Direct Object Reference) Protection
 * Factory function that creates middleware to verify resource ownership
 *
 * @param getOwnerId - Async function that retrieves the owner ID for the requested resource
 * @param options - Configuration options
 */
export function ownershipCheck(
  getOwnerId: (req: Request) => Promise<number | string | null>,
  options: {
    allowAdmin?: boolean;      // Allow admins to bypass ownership check
    paramName?: string;        // Name of URL param to use as resource ID
    errorMessage?: string;     // Custom error message
  } = {}
) {
  const { allowAdmin = true, errorMessage = 'Access denied: you do not own this resource' } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    // Must be authenticated first
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Allow admins to bypass if configured
    if (allowAdmin && (req.user.role === 'admin' || req.user.role === 'super_admin')) {
      return next();
    }

    try {
      const ownerId = await getOwnerId(req);

      if (ownerId === null) {
        // Resource not found
        return res.status(404).json({
          success: false,
          message: 'Resource not found',
        });
      }

      // Get current user's ID (from JWT payload or username)
      const currentUserId = req.user.username;

      // Compare ownership
      if (String(ownerId) !== String(currentUserId)) {
        console.warn(`[SECURITY] IDOR attempt blocked: user ${currentUserId} tried to access resource owned by ${ownerId}`);
        return res.status(403).json({
          success: false,
          message: errorMessage,
        });
      }

      next();
    } catch (error) {
      console.error('[SECURITY] Ownership check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error verifying resource ownership',
      });
    }
  };
}

/**
 * Helper to create ownership check for quote submissions
 * Verifies the authenticated user owns the quote submission
 */
export function quoteOwnershipCheck() {
  return ownershipCheck(
    async (req) => {
      const { storage } = await import('../storage.js');
      const submissionId = parseInt(req.params.id);
      if (isNaN(submissionId)) return null;

      const submission = await storage.getQuoteSubmission(submissionId);
      return submission?.email || null; // Email is the identifier
    },
    { allowAdmin: true, errorMessage: 'Access denied: you do not own this quote' }
  );
}

/**
 * Helper to create ownership check for customers
 * Verifies the authenticated user is accessing their own customer record
 */
export function customerOwnershipCheck() {
  return ownershipCheck(
    async (req) => {
      const { storage } = await import('../storage.js');
      const customerId = parseInt(req.params.id);
      if (isNaN(customerId)) return null;

      const customer = await storage.getCustomer(customerId);
      return customer?.primaryEmail || null;
    },
    { allowAdmin: true, errorMessage: 'Access denied: you do not own this customer record' }
  );
}
