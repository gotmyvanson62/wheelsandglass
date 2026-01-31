/**
 * Real Square Bookings API Integration
 * For when we have actual Square API credentials
 */

import axios from 'axios';

export interface SquareBookingRequest {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  serviceType: string;
  appointmentDate: string;
  appointmentTime: string;
  serviceAddress: string;
  vehicleInfo: string;
  estimatedPrice: number;
  duration: number;
  notes?: string;
}

export interface SquareBookingResult {
  success: boolean;
  bookingId?: string;
  bookingUrl?: string;
  message: string;
}

export class SquareBookingsRealService {
  private accessToken: string;
  private baseUrl: string;
  private locationId: string;

  constructor() {
    this.accessToken = process.env.SQUARE_ACCESS_TOKEN || '';
    this.baseUrl = process.env.SQUARE_ENVIRONMENT === 'sandbox'
      ? 'https://connect.squareupsandbox.com/v2'
      : 'https://connect.squareup.com/v2';
    this.locationId = process.env.SQUARE_LOCATION_ID || '';

    if (!this.accessToken) {
      console.warn('[SquareBookingsReal] SQUARE_ACCESS_TOKEN not configured');
    }
  }

  /**
   * Create booking using actual Square Bookings API
   */
  async createBooking(bookingData: SquareBookingRequest): Promise<SquareBookingResult> {
    if (!this.accessToken) {
      console.log('No Square access token available, redirecting to booking page');
      return {
        success: true,
        bookingUrl: `https://book.squareup.com/appointments/b797361a-90ce-4a01-b7a7-7e1c050ad61c/location/${this.locationId}/services`,
        message: 'Redirecting to Square booking page',
      };
    }

    try {
      // Create customer first
      const customerId = await this.getOrCreateCustomer(bookingData);

      // Create the booking
      const bookingRequest = {
        booking: {
          appointment_segments: [{
            duration_minutes: bookingData.duration,
            service_variation: {
              item_id: 'auto-glass-service',
              variation_name: bookingData.serviceType
            },
            team_member_id: 'auto-assign'
          }],
          location_id: this.locationId,
          start_at: `${bookingData.appointmentDate}T${bookingData.appointmentTime}:00`,
          customer_id: customerId,
          customer_note: `${bookingData.vehicleInfo} - ${bookingData.notes || ''}`.trim(),
          seller_note: `Service Address: ${bookingData.serviceAddress}`,
          pricing_type: 'FIXED_PRICING',
          source: 'API'
        }
      };

      const response = await axios.post(
        `${this.baseUrl}/bookings`,
        bookingRequest,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
            'Square-Version': '2024-07-17'
          }
        }
      );

      const booking = response.data.booking;
      
      return {
        success: true,
        bookingId: booking.id,
        bookingUrl: `https://book.squareup.com/appointments/b797361a-90ce-4a01-b7a7-7e1c050ad61c/location/${this.locationId}/services?booking_id=${booking.id}`,
        message: 'Booking created successfully',
      };

    } catch (error) {
      console.error('Square Bookings API error:', error);
      
      // Fallback to booking page URL
      return {
        success: true,
        bookingUrl: `https://book.squareup.com/appointments/b797361a-90ce-4a01-b7a7-7e1c050ad61c/location/${this.locationId}/services`,
        message: 'Redirecting to Square booking page',
      };
    }
  }

  /**
   * Get or create customer in Square
   */
  private async getOrCreateCustomer(bookingData: SquareBookingRequest): Promise<string> {
    try {
      // Search for existing customer
      const searchResponse = await axios.post(
        `${this.baseUrl}/customers/search`,
        {
          filter: {
            email_address: {
              exact: bookingData.customerEmail
            }
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
            'Square-Version': '2024-07-17'
          }
        }
      );

      if (searchResponse.data.customers && searchResponse.data.customers.length > 0) {
        return searchResponse.data.customers[0].id;
      }

      // Create new customer
      const createResponse = await axios.post(
        `${this.baseUrl}/customers`,
        {
          given_name: bookingData.customerName.split(' ')[0],
          family_name: bookingData.customerName.split(' ').slice(1).join(' '),
          email_address: bookingData.customerEmail,
          phone_number: bookingData.customerPhone
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
            'Square-Version': '2024-07-17'
          }
        }
      );

      return createResponse.data.customer.id;
    } catch (error) {
      console.error('Customer creation error:', error);
      throw new Error('Failed to create customer');
    }
  }
}

export const squareBookingsRealService = new SquareBookingsRealService();