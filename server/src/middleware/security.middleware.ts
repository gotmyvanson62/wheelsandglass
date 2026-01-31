import type { Request, Response, NextFunction } from 'express';

/**
 * Security headers middleware
 * Adds Content Security Policy and other security headers
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Content Security Policy
  // Restricts sources of executable scripts, styles, images, etc.
  const cspDirectives = [
    // Default: only allow from same origin
    "default-src 'self'",

    // Scripts: self, inline for React hydration, and eval for dev tools
    process.env.NODE_ENV === 'production'
      ? "script-src 'self'"
      : "script-src 'self' 'unsafe-inline' 'unsafe-eval'",

    // Styles: self and inline (required for many UI libraries)
    "style-src 'self' 'unsafe-inline'",

    // Images: self, data URIs (for inline images), and HTTPS sources
    "img-src 'self' data: https:",

    // Fonts: self and common font CDNs
    "font-src 'self' data:",

    // Connect: self for API calls, and external APIs we use
    "connect-src 'self' https://vpic.nhtsa.dot.gov https://api.openphone.com https://connect.squareup.com",

    // Frames: deny embedding in iframes (clickjacking protection)
    "frame-ancestors 'none'",

    // Form actions: only allow forms to submit to same origin
    "form-action 'self'",

    // Base URI: restrict <base> tag to same origin
    "base-uri 'self'",

    // Object sources: disallow plugins like Flash
    "object-src 'none'",

    // Upgrade insecure requests in production
    ...(process.env.NODE_ENV === 'production' ? ["upgrade-insecure-requests"] : []),
  ];

  res.setHeader('Content-Security-Policy', cspDirectives.join('; '));

  // X-Content-Type-Options: prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // X-Frame-Options: prevent clickjacking (backup for older browsers)
  res.setHeader('X-Frame-Options', 'DENY');

  // X-XSS-Protection: enable browser XSS filter (legacy browsers)
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer-Policy: control how much referrer info is sent
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions-Policy: restrict browser features
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  // Strict-Transport-Security: enforce HTTPS (only in production)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  next();
}

/**
 * CORS preflight handler for specific origins
 * More restrictive than generic cors() middleware
 */
export function restrictedCors(allowedOrigins: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;

    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }

    // Handle preflight
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }

    next();
  };
}
