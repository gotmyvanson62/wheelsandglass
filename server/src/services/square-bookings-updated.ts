/**
 * Square Bookings API Service - Updated to match official Square API
 * Uses Square Bookings API as per https://developer.squareup.com/docs/bookings-api/what-it-is
 */

import axios from 'axios';
import { omegaPricingService, type PricingRequest } from './omega-pricing-updated.js';

export interface AvailabilitySlot {
  startAt: string;
  locationId: string;
  appointmentSegments: Array<{
    durationMinutes: number;
    teamMemberId: string;
    serviceVariationId: string;
    serviceVariationVersion: number;
  }>;
}

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
   * Search available time slots using Square Bookings SearchAvailability API
   * @see https://developer.squareup.com/reference/square/bookings-api/search-availability
   */
  async getAvailableSlots(
    date: string,
    serviceVariationId?: string,
    teamMemberId?: string,
    durationMinutes: number = 120
  ): Promise<AvailabilitySlot[]> {
    try {
      // Build the start_at range for the requested date (full day)
      const startAtMin = `${date}T00:00:00Z`;
      const startAtMax = `${date}T23:59:59Z`;

      const searchRequest = {
        query: {
          filter: {
            start_at_range: {
              start_at: startAtMin,
              end_at: startAtMax,
            },
            location_id: this.locationId,
            segment_filters: [
              {
                service_variation_id: serviceVariationId || 'auto-glass-service',
                team_member_id_filter: teamMemberId ? {
                  any: [teamMemberId]
                } : {
                  all: [] // Any available team member
                },
              },
            ],
          },
        },
      };

      const response = await axios.post(
        `${this.baseUrl}/bookings/availability/search`,
        searchRequest,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
            'Square-Version': '2024-07-17',
          },
        }
      );

      const availabilities = response.data.availabilities || [];

      // Transform Square response to our AvailabilitySlot interface
      return availabilities.map((slot: any) => ({
        startAt: slot.start_at,
        locationId: slot.location_id,
        appointmentSegments: slot.appointment_segments?.map((seg: any) => ({
          durationMinutes: seg.duration_minutes,
          teamMemberId: seg.team_member_id,
          serviceVariationId: seg.service_variation_id,
          serviceVariationVersion: seg.service_variation_version,
        })) || [],
      }));
    } catch (error: any) {
      console.error('Error fetching available slots from Square:', error.response?.data || error.message);

      // Fallback to business hours if API fails (e.g., service not configured in Square)
      if (error.response?.status === 400 || error.response?.status === 404) {
        console.log('Falling back to default business hours');
        return this.getDefaultBusinessHours(date);
      }

      return [];
    }
  }

  /**
   * Fallback method returning default business hours when Square API is unavailable
   */
  private getDefaultBusinessHours(date: string): AvailabilitySlot[] {
    const slots = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];

    return slots.map(time => ({
      startAt: `${date}T${time}:00Z`,
      locationId: this.locationId,
      appointmentSegments: [{
        durationMinutes: 120,
        teamMemberId: 'auto-assign',
        serviceVariationId: 'auto-glass-service',
        serviceVariationVersion: 1,
      }],
    }));
  }

  /**
   * Get simplified time slots as string array (for backward compatibility)
   */
  async getAvailableTimeSlots(date: string, serviceVariationId?: string): Promise<string[]> {
    const slots = await this.getAvailableSlots(date, serviceVariationId);
    return slots.map(slot => {
      const time = new Date(slot.startAt);
      return `${time.getUTCHours().toString().padStart(2, '0')}:${time.getUTCMinutes().toString().padStart(2, '0')}`;
    });
  }

  /**
   * Calculate pricing for service using Omega EDI pricing
   */
  async calculateServicePricing(request: PricingRequest): Promise<{
    totalPrice: number;
    laborCost: number;
    partsCost: number;
    estimatedDuration: number;
  }> {
    try {
      const pricingResult = await omegaPricingService.generatePricing(request);

      if (pricingResult.success) {
        return {
          totalPrice: pricingResult.totalPrice,
          laborCost: pricingResult.laborCost,
          partsCost: pricingResult.partsCost,
          estimatedDuration: pricingResult.estimatedDuration,
        };
      }

      // Fallback pricing if Omega fails
      return this.getFallbackPricing(request.serviceType || 'windshield-replacement');
    } catch (error) {
      console.error('Error calculating pricing via Omega EDI:', error);
      return this.getFallbackPricing(request.serviceType || 'windshield-replacement');
    }
  }

  /**
   * Fallback pricing when Omega EDI is unavailable
   */
  private getFallbackPricing(serviceType: string): {
    totalPrice: number;
    laborCost: number;
    partsCost: number;
    estimatedDuration: number;
  } {
    const pricingMap: Record<string, { parts: number; labor: number; duration: number }> = {
      'windshield-replacement': { parts: 250, labor: 150, duration: 120 },
      'side-window': { parts: 120, labor: 80, duration: 60 },
      'rear-window': { parts: 200, labor: 120, duration: 90 },
      'quarter-glass': { parts: 150, labor: 100, duration: 75 },
      'mobile-service': { parts: 0, labor: 50, duration: 30 },
    };

    const pricing = pricingMap[serviceType] || pricingMap['windshield-replacement'];

    return {
      totalPrice: pricing.parts + pricing.labor,
      laborCost: pricing.labor,
      partsCost: pricing.parts,
      estimatedDuration: pricing.duration,
    };
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

// Export singleton instance using environment variables
export const squareBookingsService = new SquareBookingsService(
  process.env.SQUARE_ACCESS_TOKEN || '',
  process.env.SQUARE_LOCATION_ID || '',
  process.env.SQUARE_ENVIRONMENT || 'sandbox'
);