/**
 * Appointment Coordinator Service
 * Orchestrates appointment scheduling between customer portal, Square Appointments, and Omega EDI
 */

import { squareBookingsService, type SquareBookingData } from './square-appointments';
import { OmegaEDIService } from './omega-edi';
import { storage } from '../storage';

export interface AppointmentRequest {
  transactionId: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  vehicleInfo: string;
  serviceType: string;
  requestedDate: string;
  requestedTime: string;
  serviceAddress: string;
  instructions?: string;
  technicianId?: string;
}

export interface AppointmentCoordinationResult {
  success: boolean;
  appointmentId?: number;
  squareAppointmentId?: string;
  omegaJobId?: string;
  bookingUrl?: string;
  message: string;
}

export class AppointmentCoordinatorService {
  private omegaService: OmegaEDIService;

  constructor() {
    // Initialize OmegaEDI service with default configuration
    const baseUrl = process.env.OMEGA_API_BASE_URL || 'https://api.omega-edi.com/v1';
    const apiKey = process.env.OMEGA_API_KEY || 'C55KeMr7T7JaHtKS';
    this.omegaService = new OmegaEDIService(baseUrl, apiKey);
  }

  /**
   * Coordinate appointment scheduling across all systems
   */
  async scheduleAppointment(request: AppointmentRequest): Promise<AppointmentCoordinationResult> {
    try {
      // Step 1: Create appointment record in our database
      const appointment = await storage.createAppointment({
        transactionId: request.transactionId,
        customerName: request.customerName,
        customerEmail: request.customerEmail,
        customerPhone: request.customerPhone || null,
        requestedDate: request.requestedDate,
        requestedTime: request.requestedTime,
        serviceAddress: request.serviceAddress,
        status: 'requested',
        technicianId: request.technicianId || null,
        squareAppointmentId: null,
        omegaAppointmentId: null,
        instructions: request.instructions || null,
      });

      // Step 2: Create booking in Square with pricing
      const squareData: SquareBookingData = {
        customerName: request.customerName,
        customerEmail: request.customerEmail,
        customerPhone: request.customerPhone,
        serviceType: request.serviceType,
        appointmentDate: request.requestedDate,
        appointmentTime: request.requestedTime,
        serviceAddress: request.serviceAddress,
        vehicleInfo: request.vehicleInfo,
        estimatedPrice: this.calculateEstimatedPrice(request.serviceType),
        duration: this.getServiceDuration(request.serviceType),
        notes: request.instructions,
      };

      const squareResult = await squareBookingsService.createBooking(squareData);
      
      if (!squareResult.success) {
        throw new Error(`Square Bookings integration failed: ${squareResult.message}`);
      }

      // Step 3: Update our appointment record with Square details
      await storage.updateAppointment(appointment.id, {
        squareAppointmentId: squareResult.bookingId || null,
        status: 'square_scheduled',
      });

      // Step 4: Push appointment details to Omega EDI
      const omegaResult = await this.createOmegaAppointment(appointment.id, request, squareResult.bookingId!);

      if (omegaResult.success) {
        await storage.updateAppointment(appointment.id, {
          omegaAppointmentId: omegaResult.omegaJobId || null,
          status: 'omega_confirmed',
        });
      }

      // Step 5: Log the coordination activity
      await storage.createActivityLog({
        type: 'appointment_scheduled',
        message: `Appointment scheduled for ${request.customerName} on ${request.requestedDate} at ${request.requestedTime}`,
        transactionId: request.transactionId,
        details: {
          appointmentId: appointment.id,
          squareAppointmentId: squareResult.bookingId,
          omegaJobId: omegaResult.omegaJobId,
          serviceAddress: request.serviceAddress,
        },
      });

      return {
        success: true,
        appointmentId: appointment.id,
        squareAppointmentId: squareResult.bookingId,
        omegaJobId: omegaResult.omegaJobId,
        bookingUrl: squareResult.bookingUrl,
        message: 'Appointment successfully scheduled across all systems',
      };

    } catch (error) {
      console.error('Appointment coordination error:', error);
      
      // Log the error
      await storage.createActivityLog({
        type: 'appointment_error',
        message: `Failed to schedule appointment for ${request.customerName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        transactionId: request.transactionId,
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      });

      return {
        success: false,
        message: `Failed to schedule appointment: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Create appointment in Omega EDI system
   */
  private async createOmegaAppointment(appointmentId: number, request: AppointmentRequest, squareAppointmentId: string) {
    try {
      // Format appointment data for Omega EDI
      const omegaAppointmentData = {
        customerName: request.customerName,
        customerEmail: request.customerEmail,
        customerPhone: request.customerPhone,
        vehicleInfo: request.vehicleInfo,
        serviceType: request.serviceType,
        scheduledDate: request.requestedDate,
        scheduledTime: request.requestedTime,
        serviceAddress: request.serviceAddress,
        technicianId: request.technicianId,
        squareReferenceId: squareAppointmentId,
        internalAppointmentId: appointmentId,
        instructions: request.instructions,
        status: 'scheduled',
      };

      // Create job/appointment in Omega EDI
      const result = await this.omegaService.createAppointment(omegaAppointmentData);
      
      return {
        success: true,
        omegaJobId: result.jobId,
        message: 'Appointment created in Omega EDI',
      };
    } catch (error) {
      console.error('Omega EDI appointment creation error:', error);
      return {
        success: false,
        message: `Omega EDI integration failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Get available appointment slots coordinated across systems
   */
  async getAvailableSlots(date: string, technicianId?: string): Promise<string[]> {
    try {
      // Get available slots from Square Appointments
      const squareSlots = await squareAppointmentsService.getAvailableSlots(date);
      
      // Get technician availability from Omega EDI
      const omegaAvailability = await this.omegaService.getTechnicianAvailability(date, technicianId);
      
      // Find intersection of available slots
      const availableSlots = squareSlots.filter(slot => 
        omegaAvailability.includes(slot)
      );
      
      return availableSlots;
    } catch (error) {
      console.error('Error getting available slots:', error);
      return [];
    }
  }

  /**
   * Update appointment status across all systems
   */
  async updateAppointmentStatus(appointmentId: number, status: string, notes?: string): Promise<boolean> {
    try {
      const appointment = await storage.getAppointment(appointmentId);
      if (!appointment) {
        throw new Error('Appointment not found');
      }

      // Update in our database
      await storage.updateAppointment(appointmentId, { status });

      // Update in Omega EDI if needed
      if (appointment.omegaAppointmentId) {
        await this.omegaService.updateAppointmentStatus(appointment.omegaAppointmentId, status, notes);
      }

      // Log the status update
      await storage.createActivityLog({
        type: 'appointment_updated',
        message: `Appointment ${appointmentId} status updated to: ${status}`,
        transactionId: appointment.transactionId,
        details: { status, notes, appointmentId },
      });

      return true;
    } catch (error) {
      console.error('Error updating appointment status:', error);
      return false;
    }
  }

  /**
   * Calculate estimated pricing for service type
   */
  private calculateEstimatedPrice(serviceType: string): number {
    const basePrices: Record<string, number> = {
      'windshield-replacement': 350,
      'side-window': 150,
      'rear-window': 250,
      'quarter-glass': 175,
      'mobile-service-fee': 50,
    };

    return basePrices[serviceType] || 300;
  }

  /**
   * Get service duration in minutes
   */
  private getServiceDuration(serviceType: string): number {
    const durations: Record<string, number> = {
      'windshield-replacement': 120, // 2 hours
      'side-window': 60,             // 1 hour
      'rear-window': 90,             // 1.5 hours
      'quarter-glass': 75,           // 1.25 hours
    };

    return durations[serviceType] || 90;
  }
}

export const appointmentCoordinator = new AppointmentCoordinatorService();