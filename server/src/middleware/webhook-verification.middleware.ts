import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * Middleware to verify Quo (OpenPhone) webhook signatures
 * Uses HMAC-SHA256 verification
 */
export function verifyQuoSignature(req: Request, res: Response, next: NextFunction) {
  const webhookSecret = process.env.QUO_WEBHOOK_SECRET;

  // Skip verification in development if not configured
  if (!webhookSecret) {
    console.warn('[WEBHOOK] Quo webhook secret not configured - skipping signature verification');
    return next();
  }

  const signature = req.headers['x-openphone-signature'] as string;

  if (!signature) {
    console.warn('[WEBHOOK] Missing Quo signature header');
    return res.status(401).json({ error: 'Missing Quo signature' });
  }

  // Get raw body for signature verification
  const rawBody = (req as any).rawBody || JSON.stringify(req.body);

  // Compute expected signature using HMAC-SHA256
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  // Use timing-safe comparison to prevent timing attacks
  try {
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );

    if (!isValid) {
      console.error('[WEBHOOK] Invalid Quo signature', {
        signature: signature.substring(0, 10) + '...',
        expected: expectedSignature.substring(0, 10) + '...'
      });
      return res.status(403).json({ error: 'Invalid Quo signature' });
    }
  } catch (error) {
    // Buffer length mismatch means invalid signature
    console.error('[WEBHOOK] Quo signature validation error:', error);
    return res.status(403).json({ error: 'Invalid Quo signature' });
  }

  next();
}

/**
 * @deprecated Use verifyQuoSignature instead - Twilio has been replaced with Quo
 * Kept for backward compatibility during migration
 */
export function verifyTwilioSignature(req: Request, res: Response, next: NextFunction) {
  console.warn('[WEBHOOK] Twilio signature verification is deprecated - migrate to Quo');
  // Skip verification since Twilio is no longer used
  return next();
}

/**
 * Middleware to verify Square webhook signatures
 * Uses HMAC-SHA256 verification
 */
export function verifySquareSignature(req: Request, res: Response, next: NextFunction) {
  const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;

  // Skip verification in development if not configured
  if (!signatureKey) {
    console.warn('[WEBHOOK] Square webhook signature key not configured - skipping signature verification');
    return next();
  }

  const signature = req.headers['x-square-hmacsha256-signature'] as string;

  if (!signature) {
    console.warn('[WEBHOOK] Missing Square signature header');
    return res.status(401).json({ error: 'Missing Square signature' });
  }

  // Square requires the raw request body for signature verification
  // We need to ensure express.json() middleware stores the raw body
  const rawBody = (req as any).rawBody;

  if (!rawBody) {
    console.error('[WEBHOOK] Raw body not available for Square signature verification');
    // Fall back to stringified body (less reliable but works in most cases)
    const bodyString = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', signatureKey)
      .update(bodyString)
      .digest('base64');

    if (signature !== expectedSignature) {
      console.error('[WEBHOOK] Invalid Square signature (using stringified body)');
      return res.status(403).json({ error: 'Invalid Square signature' });
    }

    return next();
  }

  // Compute expected signature using raw body
  const expectedSignature = crypto
    .createHmac('sha256', signatureKey)
    .update(rawBody)
    .digest('base64');

  if (signature !== expectedSignature) {
    console.error('[WEBHOOK] Invalid Square signature');
    return res.status(403).json({ error: 'Invalid Square signature' });
  }

  next();
}

/**
 * Express middleware to capture raw body for webhook signature verification
 * Must be applied BEFORE body parsers for routes that need raw body
 */
export function captureRawBody(req: Request, res: Response, next: NextFunction) {
  let rawBody = '';

  req.on('data', (chunk) => {
    rawBody += chunk.toString();
  });

  req.on('end', () => {
    (req as any).rawBody = rawBody;
    // Parse JSON manually since we intercepted the body
    if (rawBody && req.headers['content-type']?.includes('application/json')) {
      try {
        req.body = JSON.parse(rawBody);
      } catch (e) {
        // Body parsing will be handled by express.json() if this fails
      }
    }
    next();
  });
}
