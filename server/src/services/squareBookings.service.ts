import { Client, Environment } from 'square';
import type { SquareBookingData } from 'shared';

class SquareBookingsService {
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

  async createBooking(bookingData: SquareBookingData) {
    try {
      const response = await this.client.bookingsApi.createBooking({
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
      const response = await this.client.bookingsApi.retrieveBooking(bookingId);
      return response.result.booking;
    } catch (error) {
      console.error('Square get booking error:', error);
      throw error;
    }
  }

  async updateBooking(bookingId: string, version: number, bookingData: Partial<SquareBookingData>) {
    try {
      const response = await this.client.bookingsApi.updateBooking(bookingId, {
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
      const response = await this.client.bookingsApi.cancelBooking(bookingId, {
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
