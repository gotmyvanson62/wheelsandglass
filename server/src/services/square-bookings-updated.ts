/**
 * Square Bookings API Service - Updated to match official Square API
 * Uses Square Bookings API as per https://developer.squareup.com/docs/bookings-api/what-it-is
 */

import axios from 'axios';

export interface SquareBookingData {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  serviceType: string;
  appointmentDate: string;
  appointmentTime: string;
  serviceAddress: string;
  vehicleInfo: string;
  estimatedPrice: number;
  duration: number; // in minutes
  notes?: string;
  referenceId?: string; // Our transaction ID
}

export interface SquareBookingResponse {
  success: boolean;
  bookingId?: string;
  bookingUrl?: string;
  message: string;
}

export interface SquareCustomer {
  id?: string;
  given_name: string;
  family_name: string;
  email_address: string;
  phone_number?: string;
}

export interface SquareBooking {
  id?: string;
  version?: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
  start_at: string;
  location_id: string;
  appointment_segments: Array<{
    duration_minutes: number;
    service_variation: {
      item_id: string;
      variation_name: string;
    };
    team_member_id: string;
  }>;
  customer_id: string;
  customer_note?: string;
  seller_note?: string;
  pricing_type: string;
  source: string;
}

export class SquareBookingsService {
  private accessToken: string;
  private locationId: string;
  private baseUrl: string;
  private environment: string;

  constructor(accessToken: string, locationId: string, environment: string = 'sandbox') {
    this.accessToken = accessToken;
    this.locationId = locationId;
    this.environment = environment;
    this.baseUrl = environment === 'production' 
      ? 'https://connect.squareup.com/v2' 
      : 'https://connect.squareupsandbox.com/v2';
  }

  /**
   * Create or retrieve Square customer
   */
  async createOrGetCustomer(customerData: {
    given_name: string;
    family_name: string;
    email_address: string;
    phone_number?: string;
  }): Promise<string> {
    try {
      // First, search for existing customer by email
      const searchResponse = await axios.post(
        `${this.baseUrl}/customers/search`,
        {
          filter: {
            email_address: {
              exact: customerData.email_address
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

      // Create new customer if not found
      const createResponse = await axios.post(
        `${this.baseUrl}/customers`,
        customerData,
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
      console.error('Square customer creation error:', error);
      throw new Error(`Failed to create/get Square customer: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Create booking using Square Bookings API
   */
  async createBooking(bookingData: SquareBookingData): Promise<SquareBookingResponse> {
    try {
      // Split customer name
      const nameParts = bookingData.customerName.split(' ');
      const given_name = nameParts[0] || 'Customer';
      const family_name = nameParts.slice(1).join(' ') || 'Unknown';

      // Create or get customer
      const customerId = await this.createOrGetCustomer({
        given_name,
        family_name,
        email_address: bookingData.customerEmail,
        phone_number: bookingData.customerPhone,
      });

      // Create booking
      const bookingRequest: { booking: SquareBooking } = {
        booking: {
          start_at: `${bookingData.appointmentDate}T${bookingData.appointmentTime}:00Z`,
          location_id: this.locationId,
          appointment_segments: [{
            duration_minutes: bookingData.duration,
            service_variation: {
              item_id: 'auto-glass-service',
              variation_name: bookingData.serviceType
            },
            team_member_id: 'auto-assign'
          }],
          customer_id: customerId,
          customer_note: `${bookingData.vehicleInfo} - ${bookingData.notes || ''}`.trim(),
          seller_note: `Service Address: ${bookingData.serviceAddress}\nEstimated Price: $${bookingData.estimatedPrice}\nReference ID: ${bookingData.referenceId || 'N/A'}`,
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
        bookingUrl: `https://squareup.com/appointments/${booking.id}`,
        message: 'Booking created successfully'
      };

    } catch (error) {
      console.error('Square booking creation error:', error);
      return {
        success: false,
        message: `Failed to create booking: ${error.response?.data?.message || error.message}`
      };
    }
  }

  /**
   * Retrieve a booking by ID
   */
  async getBooking(bookingId: string): Promise<SquareBooking | null> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/bookings/${bookingId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Square-Version': '2024-07-17'
          }
        }
      );

      return response.data.booking;
    } catch (error) {
      console.error('Error retrieving Square booking:', error);
      return null;
    }
  }

  /**
   * Update a booking
   */
  async updateBooking(bookingId: string, updates: Partial<SquareBooking>): Promise<boolean> {
    try {
      const response = await axios.put(
        `${this.baseUrl}/bookings/${bookingId}`,
        { booking: updates },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
            'Square-Version': '2024-07-17'
          }
        }
      );

      return response.status === 200;
    } catch (error) {
      console.error('Error updating Square booking:', error);
      return false;
    }
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(bookingId: string, cancellationReason?: string): Promise<boolean> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/bookings/${bookingId}/cancel`,
        {
          booking_version: 1, // Should get actual version from booking
          cancellation_reason: cancellationReason || 'Customer cancellation'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
            'Square-Version': '2024-07-17'
          }
        }
      );

      return response.status === 200;
    } catch (error) {
      console.error('Error cancelling Square booking:', error);
      return false;
    }
  }

  /**
   * List bookings with optional filters
   */
  async listBookings(filters?: {
    location_id?: string;
    start_at_min?: string;
    start_at_max?: string;
    team_member_id?: string;
    customer_id?: string;
  }): Promise<SquareBooking[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      }

      const response = await axios.get(
        `${this.baseUrl}/bookings?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Square-Version': '2024-07-17'
          }
        }
      );

      return response.data.bookings || [];
    } catch (error) {
      console.error('Error listing Square bookings:', error);
      return [];
    }
  }

  /**
   * Get available time slots for a service
   */
  async getAvailableSlots(date: string, serviceVariationId?: string): Promise<string[]> {
    try {
      // This would use Square's availability API in production
      // For now, return standard business hours
      const slots = [
        '08:00', '09:00', '10:00', '11:00',
        '13:00', '14:00', '15:00', '16:00'
      ];
      
      // Simulate some slots being unavailable
      const availableSlots = slots.filter(() => Math.random() > 0.3);
      
      return availableSlots;
    } catch (error) {
      console.error('Error fetching available slots:', error);
      return [];
    }
  }

  /**
   * Calculate pricing for service (this would integrate with Square's pricing)
   */
  calculateServicePricing(serviceType: string): number {
    const pricingMap: Record<string, number> = {
      'windshield-replacement': 350,
      'side-window': 150,
      'rear-window': 250,
      'quarter-glass': 175,
      'mobile-service': 50,
    };

    return pricingMap[serviceType] || 300;
  }

  /**
   * Test connection to Square API
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/locations`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Square-Version': '2024-07-17'
          }
        }
      );
      
      return response.status === 200 && response.data.locations?.length > 0;
    } catch (error) {
      console.error('Square API connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance with your production credentials
export const squareBookingsService = new SquareBookingsService(
  'EAAAEASHtAfuFZ07V23Wse8pEvx2JO0BEZIrnvC_dJsCdjeTGREr-plGYpBqKu6V',
  'E7GCF80WM2V05',
  'production'
);