import { Client, Environment } from 'square';

class SquareService {
  private client: Client;

  constructor() {
    const accessToken = process.env.SQUARE_ACCESS_TOKEN;
    const environment = process.env.SQUARE_ENVIRONMENT === 'production'
      ? Environment.Production
      : Environment.Sandbox;

    if (!accessToken) {
      console.warn('Square access token is not configured');
    }

    this.client = new Client({
      accessToken: accessToken || 'dummy-token',
      environment,
    });
  }

  async createPayment(amount: number, sourceId: string, idempotencyKey: string) {
    try {
      const response = await this.client.paymentsApi.createPayment({
        sourceId,
        idempotencyKey,
        amountMoney: {
          amount: BigInt(Math.round(amount * 100)), // Convert to cents
          currency: 'USD',
        },
        locationId: process.env.SQUARE_LOCATION_ID!,
      });
      return response.result.payment;
    } catch (error) {
      console.error('Square payment error:', error);
      throw error;
    }
  }

  async getPayment(paymentId: string) {
    try {
      const response = await this.client.paymentsApi.getPayment(paymentId);
      return response.result.payment;
    } catch (error) {
      console.error('Square get payment error:', error);
      throw error;
    }
  }

  async listPayments(locationId?: string) {
    try {
      const response = await this.client.paymentsApi.listPayments(
        undefined,
        undefined,
        undefined,
        locationId || process.env.SQUARE_LOCATION_ID
      );
      return response.result.payments;
    } catch (error) {
      console.error('Square list payments error:', error);
      throw error;
    }
  }

  async createPaymentLink(amount: number, description: string) {
    try {
      const response = await this.client.checkoutApi.createPaymentLink({
        order: {
          locationId: process.env.SQUARE_LOCATION_ID!,
          lineItems: [{
            name: description,
            quantity: '1',
            basePriceMoney: {
              amount: BigInt(Math.round(amount * 100)),
              currency: 'USD',
            },
          }],
        },
      });
      return response.result.paymentLink;
    } catch (error) {
      console.error('Square payment link error:', error);
      throw error;
    }
  }
}

export const squareService = new SquareService();
