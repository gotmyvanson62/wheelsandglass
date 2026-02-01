import { Client, Environment } from 'square';
import type { SquareBookingData } from 'shared';

class SquareBookingsService {
  private client: Client | null = null;
  private isConfigured: boolean = false;

  constructor() {
    const accessToken = process.env.SQUARE_ACCESS_TOKEN;
    const environment = process.env.SQUARE_ENVIRONMENT === 'production'
      ? Environment.Production
      : Environment.Sandbox;

    if (!accessToken) {
      console.warn('Square access token is not configured - booking features will be disabled');
      this.isConfigured = false;
    } else {
      this.client = new Client({
        accessToken,
        environment,
      });
      this.isConfigured = true;
    }
  }

  private ensureConfigured(): Client {
    if (!this.client || !this.isConfigured) {
      throw new Error('Square is not configured. Set SQUARE_ACCESS_TOKEN environment variable.');
    }
    return this.client;
  }

  isReady(): boolean {
    return this.isConfigured;
  }

  async createBooking(bookingData: SquareBookingData) {
    try {
      const client = this.ensureConfigured();
      const response = await client.bookingsApi.createBooking({
        booking: bookingData,
      });
      return response.result.booking;
    } catch (error) {
      console.error('Square create booking error:', error);
      throw error;
    }
  }

  async getBooking(bookingId: string) {
    try {
      const client = this.ensureConfigured();
      const response = await client.bookingsApi.retrieveBooking(bookingId);
      return response.result.booking;
    } catch (error) {
      console.error('Square get booking error:', error);
      throw error;
    }
  }

  async updateBooking(bookingId: string, version: number, bookingData: Partial<SquareBookingData>) {
    try {
      const client = this.ensureConfigured();
      const response = await client.bookingsApi.updateBooking(bookingId, {
        booking: {
          ...bookingData,
          version,
        },
      });
      return response.result.booking;
    } catch (error) {
      console.error('Square update booking error:', error);
      throw error;
    }
  }

  async cancelBooking(bookingId: string, version: number) {
    try {
      const client = this.ensureConfigured();
      const response = await client.bookingsApi.cancelBooking(bookingId, {
        bookingVersion: version,
      });
      return response.result.booking;
    } catch (error) {
      console.error('Square cancel booking error:', error);
      throw error;
    }
  }
}

export const squareBookingsService = new SquareBookingsService();
