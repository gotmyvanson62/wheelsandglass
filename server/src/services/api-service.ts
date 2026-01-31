import pRetry from 'p-retry';

/**
 * Centralized API service wrapper for external API calls with retry logic
 */
export class ApiService {
  /**
   * Execute a function with automatic retry on failure
   * @param fn - Function to execute
   * @param retries - Number of retry attempts (default: 3)
   * @returns Promise with the result
   */
  static async callWithRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
    return pRetry(fn, { 
      retries, 
      minTimeout: 1000,
      maxTimeout: 5000,
      factor: 2,
      onFailedAttempt: (error) => {
        console.log(`[ApiService] Attempt ${error.attemptNumber} failed. ${error.retriesLeft} retries left.`);
      }
    });
  }

  /**
   * Handle API errors with standardized logging
   * @param operation - Description of the operation
   * @param error - The error that occurred
   * @param correlationId - Optional correlation ID for tracking
   */
  static logApiError(operation: string, error: unknown, correlationId?: string): void {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    const logPrefix = correlationId ? `[${correlationId}]` : '[ApiService]';
    console.error(`${logPrefix} ${operation} failed:`, errorMsg);
  }

  /**
   * Validate webhook signature for security
   * @param body - Request body
   * @param signature - Provided signature
   * @param secret - Webhook secret
   * @returns Boolean indicating if signature is valid
   */
  static verifyWebhookSignature(body: string, signature: string, secret: string): boolean {
    if (!signature || !secret) return false;
    
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', secret);
    const computedSignature = `sha256=${hmac.update(body).digest('hex')}`;
    
    return crypto.timingSafeEqual(
      Buffer.from(signature), 
      Buffer.from(computedSignature)
    );
  }
}