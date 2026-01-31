/**
 * Square Payment Service - Quick Pay Checkout for exact Omega EDI pricing
 * Creates payment links with exact amounts post-booking
 */

import axios from 'axios';

export interface PaymentLinkRequest {
  customerName: string;
  customerEmail: string;
  amount: number; // Exact Omega EDI amount
  description: string;
  omegaQuoteId: string;
  squareBookingId: string;
}

export interface PaymentLinkResult {
  success: boolean;
  paymentLinkId?: string;
  paymentUrl?: string;
  message: string;
  error?: string;
}

export class SquarePaymentService {
  private accessToken: string;
  private baseUrl: string;
  private locationId: string;

  constructor() {
    this.accessToken = process.env.SQUARE_ACCESS_TOKEN || '';
    this.baseUrl = process.env.SQUARE_ENVIRONMENT === 'sandbox'
      ? 'https://connect.squareupsandbox.com'
      : 'https://connect.squareup.com';
    this.locationId = process.env.SQUARE_LOCATION_ID || '';

    if (!this.accessToken) {
      console.warn('[SquarePaymentService] SQUARE_ACCESS_TOKEN not configured');
    }
    if (!this.locationId) {
      console.warn('[SquarePaymentService] SQUARE_LOCATION_ID not configured');
    }
  }

  /**
   * Create Square Quick Pay checkout link for exact Omega EDI pricing
   */
  async createPaymentLink(request: PaymentLinkRequest): Promise<PaymentLinkResult> {
    try {
      console.log('🔗 Creating Square payment link for:', {
        amount: request.amount,
        customer: request.customerName,
        omegaQuoteId: request.omegaQuoteId
      });

      const idempotencyKey = `payment-${request.omegaQuoteId}-${Date.now()}`;
      
      const paymentData = {
        idempotency_key: idempotencyKey,
        quick_pay: {
          name: request.description,
          price_money: {
            amount: Math.round(request.amount * 100), // Convert to cents
            currency: 'USD'
          },
          location_id: this.locationId
        },
        checkout_options: {
          ask_for_shipping_address: false,
          merchant_support_email: 'support@wheelsandglass.com',
          custom_fields: [
            {
              title: 'Omega EDI Quote Reference',
              required: false
            }
          ]
        }
      };

      const response = await axios.post(
        `${this.baseUrl}/v2/online-checkout/payment-links`,
        paymentData,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
            'Square-Version': '2025-01-21'
          }
        }
      );

      if (response.data?.payment_link) {
        const paymentLink = response.data.payment_link;
        
        return {
          success: true,
          paymentLinkId: paymentLink.id,
          paymentUrl: paymentLink.url,
          message: `Payment link created: $${request.amount.toFixed(2)}`
        };
      } else {
        throw new Error('Invalid response from Square API');
      }

    } catch (error: any) {
      console.error('Square payment link creation failed:', error.response?.data || error.message);
      
      return {
        success: false,
        message: 'Failed to create payment link',
        error: error.response?.data?.errors?.[0]?.detail || error.message
      };
    }
  }

  /**
   * Retrieve payment link status
   */
  async getPaymentLinkStatus(paymentLinkId: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/v2/online-checkout/payment-links/${paymentLinkId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Square-Version': '2025-01-21'
          }
        }
      );

      return response.data.payment_link;
    } catch (error: any) {
      console.error('Failed to retrieve payment link status:', error.response?.data || error.message);
      throw error;
    }
  }
}

export const squarePaymentService = new SquarePaymentService();