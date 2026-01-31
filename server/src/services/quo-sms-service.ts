/**
 * Quo (OpenPhone) SMS Service
 * Replaces Twilio for SMS operations
 *
 * API Documentation: https://www.openphone.com/docs/api
 */

import crypto from 'crypto';

// ===== TYPE DEFINITIONS =====

interface QuoSendMessageRequest {
  from: string; // Phone number ID from Quo
  to: string[]; // Array of E.164 phone numbers
  content: string;
}

export interface QuoMessage {
  id: string;
  object: 'message';
  from: string;
  to: string[];
  content: string;
  direction: 'outgoing' | 'incoming';
  status: 'sent' | 'delivered' | 'failed' | 'received';
  createdAt: string;
  conversationId: string;
}

interface QuoApiResponse<T> {
  data: T;
}

interface QuoConversation {
  id: string;
  object: 'conversation';
  phoneNumberId: string;
  participants: string[];
  createdAt: string;
  updatedAt: string;
}

interface QuoWebhookPayload {
  id: string;
  object: 'event';
  type: 'message.received' | 'message.delivered' | 'message.failed' | 'call.completed' | 'voicemail.received';
  data: {
    object: QuoMessage | unknown;
  };
  createdAt: string;
  apiVersion: string;
}

// ===== SERVICE CLASS =====

class QuoSmsService {
  private apiKey: string;
  private phoneNumberId: string;
  private baseUrl: string;
  private isConfigured: boolean;

  constructor() {
    this.apiKey = process.env.QUO_API_KEY || '';
    this.phoneNumberId = process.env.QUO_PHONE_NUMBER_ID || '';
    this.baseUrl = process.env.QUO_BASE_URL || 'https://api.openphone.com/v1';
    this.isConfigured = !!(this.apiKey && this.phoneNumberId);

    if (!this.isConfigured) {
      console.warn('[QuoSMS] Service not configured - SMS operations will be logged only');
      console.warn('[QuoSMS] Set QUO_API_KEY and QUO_PHONE_NUMBER_ID to enable SMS');
    } else {
      console.log('[QuoSMS] Service initialized successfully');
    }
  }

  /**
   * Check if the service is properly configured
   */
  isReady(): boolean {
    return this.isConfigured;
  }

  /**
   * Format phone number to E.164 format (+1XXXXXXXXXX)
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');

    // Handle different formats
    if (digits.startsWith('1') && digits.length === 11) {
      return `+${digits}`;
    }
    if (digits.length === 10) {
      return `+1${digits}`;
    }
    // Already in E.164 format
    if (phone.startsWith('+')) {
      return phone;
    }
    // Default: assume US number
    return `+${digits}`;
  }

  /**
   * Send SMS via Quo API
   * @param to - Recipient phone number
   * @param content - Message content
   * @returns QuoMessage if sent, null if not configured
   */
  async sendSMS(to: string, content: string): Promise<QuoMessage | null> {
    const formattedTo = this.formatPhoneNumber(to);

    // If not configured, log and return null
    if (!this.isConfigured) {
      console.log(`[QuoSMS] Would send to ${formattedTo}: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`);
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.phoneNumberId,
          to: [formattedTo],
          content,
        } as QuoSendMessageRequest),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[QuoSMS] API error ${response.status}: ${errorText}`);
        throw new Error(`Quo API error: ${response.status} - ${errorText}`);
      }

      const result: QuoApiResponse<QuoMessage> = await response.json();
      console.log(`[QuoSMS] Sent message ${result.data.id} to ${formattedTo}`);
      return result.data;

    } catch (error) {
      console.error('[QuoSMS] Failed to send message:', error);
      throw error;
    }
  }

  /**
   * Send bulk SMS to multiple recipients
   * @param recipients - Array of phone numbers
   * @param content - Message content
   * @returns QuoMessage if sent, null if not configured
   */
  async sendBulkSMS(recipients: string[], content: string): Promise<QuoMessage | null> {
    const formattedRecipients = recipients.map(r => this.formatPhoneNumber(r));

    if (!this.isConfigured) {
      console.log(`[QuoSMS] Would send bulk to ${formattedRecipients.length} recipients: "${content.substring(0, 50)}..."`);
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.phoneNumberId,
          to: formattedRecipients,
          content,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Quo API error: ${response.status} - ${errorText}`);
      }

      const result: QuoApiResponse<QuoMessage> = await response.json();
      console.log(`[QuoSMS] Sent bulk message ${result.data.id} to ${formattedRecipients.length} recipients`);
      return result.data;

    } catch (error) {
      console.error('[QuoSMS] Bulk send failed:', error);
      throw error;
    }
  }

  /**
   * Get conversation history for a phone number
   * @param phoneNumber - Participant phone number
   * @returns Array of messages
   */
  async getConversation(phoneNumber: string): Promise<QuoMessage[]> {
    if (!this.isConfigured) {
      console.log(`[QuoSMS] Would fetch conversation for ${phoneNumber}`);
      return [];
    }

    try {
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      const params = new URLSearchParams({
        phoneNumberId: this.phoneNumberId,
        participants: formattedPhone,
      });

      const response = await fetch(`${this.baseUrl}/conversations?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Quo API error: ${response.status}`);
      }

      const result = await response.json();
      return result.data || [];

    } catch (error) {
      console.error('[QuoSMS] Failed to get conversation:', error);
      return [];
    }
  }

  /**
   * Get a specific message by ID
   * @param messageId - Quo message ID
   * @returns QuoMessage or null
   */
  async getMessage(messageId: string): Promise<QuoMessage | null> {
    if (!this.isConfigured) {
      console.log(`[QuoSMS] Would fetch message ${messageId}`);
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/messages/${messageId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Quo API error: ${response.status}`);
      }

      const result: QuoApiResponse<QuoMessage> = await response.json();
      return result.data;

    } catch (error) {
      console.error('[QuoSMS] Failed to get message:', error);
      return null;
    }
  }

  /**
   * List recent messages
   * @param limit - Number of messages to retrieve (max 100)
   * @returns Array of messages
   */
  async listMessages(limit: number = 20): Promise<QuoMessage[]> {
    if (!this.isConfigured) {
      console.log(`[QuoSMS] Would list ${limit} messages`);
      return [];
    }

    try {
      const params = new URLSearchParams({
        phoneNumberId: this.phoneNumberId,
        maxResults: String(Math.min(limit, 100)),
      });

      const response = await fetch(`${this.baseUrl}/messages?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Quo API error: ${response.status}`);
      }

      const result = await response.json();
      return result.data || [];

    } catch (error) {
      console.error('[QuoSMS] Failed to list messages:', error);
      return [];
    }
  }

  /**
   * Validate Quo webhook signature
   * @param payload - Raw request body string
   * @param signature - x-openphone-signature header value
   * @param secret - Webhook signing secret from Quo dashboard
   * @returns true if signature is valid
   */
  validateWebhookSignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    if (!signature || !secret) {
      return false;
    }

    try {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

      // Use timing-safe comparison to prevent timing attacks
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch (error) {
      console.error('[QuoSMS] Signature validation error:', error);
      return false;
    }
  }

  /**
   * Parse webhook payload
   * @param body - Request body
   * @returns Parsed QuoWebhookPayload or null
   */
  parseWebhookPayload(body: unknown): QuoWebhookPayload | null {
    try {
      const payload = body as QuoWebhookPayload;

      if (!payload.id || !payload.type || !payload.data) {
        console.error('[QuoSMS] Invalid webhook payload structure');
        return null;
      }

      return payload;
    } catch (error) {
      console.error('[QuoSMS] Failed to parse webhook payload:', error);
      return null;
    }
  }

  /**
   * Extract message from webhook payload
   * @param payload - Parsed webhook payload
   * @returns QuoMessage if message event, null otherwise
   */
  extractMessageFromWebhook(payload: QuoWebhookPayload): QuoMessage | null {
    if (!payload.type.startsWith('message.')) {
      return null;
    }

    return payload.data.object as QuoMessage;
  }
}

// ===== SINGLETON EXPORT =====

export const quoSmsService = new QuoSmsService();
export default QuoSmsService;
export type { QuoWebhookPayload, QuoConversation };
