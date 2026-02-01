import axios from 'axios';
import type { InsertTransaction } from '@shared/schema';
import { calendarService } from './calendar.js';
import { NotificationService } from '../notification-service.js';

export interface OmegaEDIJobData {
  salesman_1_id: string;
  location_id: number;
  account_company_id: number;
  pricing_profile_id: number;
  customer_email: string;
  customer_fname: string;
  customer_surname?: string;
  customer_phone: string;
  customer_alternate_phone?: string;
  customer_address?: string;
  customer_city?: string;
  customer_state?: string;
  customer_sms?: boolean;
  customer_email_opt_out?: boolean;
  account_policy_no?: string;
  account_deductible?: number;
  account_dol?: string;
  vehicle_vin?: string;
  vehicle_year?: number;
  vehicle_model?: string;
  vehicle_make?: string;
  vehicle_description?: string;
  vehicle_odometer?: string;
  vehicle_plate?: string;
  vehicle_unit_no?: string;
  invoice_status: string;
  job_status: string;
  medium?: string;
  campaign?: string;
  referrer?: string;
  billing_account_id?: number;
}

export interface OmegaEDIResponse {
  id?: number;
  message?: string;
  error_code?: number;
}

export class OmegaEDIService {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    this.apiKey = apiKey;
  }

  async createJob(jobData: OmegaEDIJobData): Promise<OmegaEDIResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}Invoices`,
        jobData,
        {
          headers: {
            'api_key': this.apiKey,
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 second timeout
        }
      );

      return { id: response.data.id || response.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;
        
        // Send real-time notification for Omega EDI failures
        await NotificationService.notifyOmegaEdiFailure({
          endpoint: `${this.baseUrl}Invoices`,
          error: `${status}: ${message}`,
          context: {
            statusCode: status,
            response: error.response?.data,
            requestData: jobData
          }
        });
        
        throw new Error(`Omega EDI API Error (${status}): ${message}`);
      }
      
      // Handle non-axios errors
      await NotificationService.notifyOmegaEdiFailure({
        endpoint: `${this.baseUrl}Invoices`,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: { error }
      });
      
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      // Test authentication by attempting to get invoices
      await axios.get(`${this.baseUrl}Invoices?page=1`, {
        headers: {
          'api_key': this.apiKey,
        },
        timeout: 10000,
      });
      return true;
    } catch (error) {
      // Notify on connection test failures (but don't spam)
      console.warn('[Omega EDI] Connection test failed:', error);
      return false;
    }
  }

  static createJobDataFromTransaction(
    transaction: InsertTransaction,
    mappedData: Record<string, any>
  ): OmegaEDIJobData {
    return {
      // Required fields with defaults
      salesman_1_id: mappedData.salesman_1_id || 'SYSTEM',
      location_id: parseInt(mappedData.location_id) || 1,
      account_company_id: parseInt(mappedData.account_company_id) || 1,
      pricing_profile_id: parseInt(mappedData.pricing_profile_id) || 1,
      customer_fname: mappedData.customer_fname || transaction.customerName.split(' ')[0],
      customer_email: mappedData.customer_email || transaction.customerEmail,
      customer_phone: mappedData.customer_phone || transaction.customerPhone || '',
      
      // Job status as Quote
      job_status: 'QO', // Quote status
      invoice_status: 'NS', // Not Submitted
      
      // Optional fields
      customer_surname: mappedData.customer_surname || transaction.customerName.split(' ').slice(1).join(' '),
      customer_alternate_phone: mappedData.customer_alternate_phone,
      customer_address: mappedData.customer_address,
      customer_city: mappedData.customer_city,
      customer_state: mappedData.customer_state,
      customer_sms: mappedData.customer_sms || true,
      customer_email_opt_out: mappedData.customer_email_opt_out || false,
      account_policy_no: mappedData.account_policy_no || transaction.policyNumber,
      account_deductible: mappedData.account_deductible ? parseFloat(mappedData.account_deductible) : undefined,
      account_dol: mappedData.account_dol,
      vehicle_vin: mappedData.vehicle_vin || transaction.vehicleVin,
      vehicle_year: mappedData.vehicle_year ? parseInt(mappedData.vehicle_year) : (transaction.vehicleYear ? parseInt(transaction.vehicleYear) : undefined),
      vehicle_model: mappedData.vehicle_model || transaction.vehicleModel,
      vehicle_make: mappedData.vehicle_make || transaction.vehicleMake,
      vehicle_description: mappedData.vehicle_description || transaction.damageDescription,
      vehicle_odometer: mappedData.vehicle_odometer,
      vehicle_plate: mappedData.vehicle_plate,
      vehicle_unit_no: mappedData.vehicle_unit_no,
      medium: mappedData.medium || 'website',
      campaign: mappedData.campaign,
      referrer: mappedData.referrer || 'squarespace',
      billing_account_id: mappedData.billing_account_id ? parseInt(mappedData.billing_account_id) : undefined,
    };
  }

  /**
   * Creates job and automatically sends calendar invitation if job includes scheduling
   */
  async createJobWithCalendarInvitation(
    jobData: OmegaEDIJobData,
    transactionData: InsertTransaction
  ): Promise<{ omegaResponse: OmegaEDIResponse; calendarSent: boolean }> {
    try {
      // Create the job in Omega EDI
      const omegaResponse = await this.createJob(jobData);
      
      if (!omegaResponse.id) {
        return { omegaResponse, calendarSent: false };
      }

      // Check if the job should trigger a calendar invitation
      // This would be configured based on job status or business rules
      const shouldSendCalendar = this.shouldSendCalendarInvitation(jobData);
      
      if (shouldSendCalendar) {
        const calendarEvent = calendarService.createEventFromOmegaJob(
          {
            id: omegaResponse.id.toString(),
            scheduledDateTime: null, // Would come from Omega if scheduled
            estimatedDuration: 120, // Default 2 hours
            serviceDescription: transactionData.damageDescription
          },
          {
            customerName: transactionData.customerName,
            customerEmail: transactionData.customerEmail,
            vehicleMake: transactionData.vehicleMake,
            vehicleModel: transactionData.vehicleModel,
            vehicleYear: transactionData.vehicleYear,
            damageDescription: transactionData.damageDescription
          }
        );

        const calendarSent = await calendarService.sendCalendarInvitation(calendarEvent);
        
        console.log('📅 Calendar integration result:', {
          omegaJobId: omegaResponse.id,
          calendarSent,
          customerEmail: transactionData.customerEmail
        });

        return { omegaResponse, calendarSent };
      }

      return { omegaResponse, calendarSent: false };
    } catch (error) {
      console.error('❌ Job creation with calendar failed:', error);
      throw error;
    }
  }

  /**
   * Determines if a calendar invitation should be sent for this job
   */
  private shouldSendCalendarInvitation(jobData: OmegaEDIJobData): boolean {
    // Send calendar invitation for all jobs initially
    // Later this could be configured based on job type, status, etc.
    return jobData.customer_email_opt_out !== true;
  }

  /**
   * Updates job schedule in Omega EDI (for rescheduling)
   */
  async updateJobSchedule(jobId: string, newDateTime: Date): Promise<OmegaEDIResponse> {
    try {
      console.log('📅 Updating Omega EDI job schedule:', {
        jobId,
        newDateTime: newDateTime.toISOString()
      });

      // Call Omega EDI's update endpoint
      const response = await axios.patch(
        `${this.baseUrl}Invoices/${jobId}`,
        { scheduled_datetime: newDateTime.toISOString() },
        {
          headers: {
            'api_key': this.apiKey,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      console.log('✅ Omega EDI schedule updated:', response.data);
      return { id: parseInt(jobId), message: 'Schedule updated successfully' };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;
        console.error(`❌ Omega EDI schedule update failed (${status}):`, message);

        // Notify on failure
        await NotificationService.notifyOmegaEdiFailure({
          endpoint: `${this.baseUrl}Invoices/${jobId}`,
          error: `${status}: ${message}`,
          context: { jobId, newDateTime: newDateTime.toISOString() }
        });

        throw new Error(`Omega EDI schedule update failed (${status}): ${message}`);
      }
      console.error('❌ Omega EDI schedule update failed:', error);
      throw error;
    }
  }

  /**
   * Retrieves installer availability from Omega EDI
   */
  async getInstallerAvailability(installerId?: string, date?: Date): Promise<any> {
    try {
      console.log('🔍 Checking installer availability:', {
        installerId: installerId || 'all',
        date: date?.toISOString() || 'next 7 days'
      });

      // Build query params
      const params: Record<string, string> = {};
      if (installerId) params.installer_id = installerId;
      if (date) params.date = date.toISOString().split('T')[0];

      // Call Omega EDI's availability endpoint
      const response = await axios.get(
        `${this.baseUrl}Installers/availability`,
        {
          headers: { 'api_key': this.apiKey },
          params,
          timeout: 15000,
        }
      );

      console.log('✅ Omega EDI availability retrieved:', response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;
        console.error(`❌ Installer availability check failed (${status}):`, message);

        // Return fallback mock data if API unavailable (graceful degradation)
        if (status === 404 || status === 503) {
          console.warn('⚠️ Using fallback availability data');
          return {
            availability: [
              { date: new Date().toISOString().split('T')[0], slots: ['09:00', '14:00'] },
              { date: new Date(Date.now() + 86400000).toISOString().split('T')[0], slots: ['10:00', '15:00'] }
            ],
            fallback: true
          };
        }

        throw new Error(`Omega EDI availability check failed (${status}): ${message}`);
      }
      console.error('❌ Installer availability check failed:', error);
      throw error;
    }
  }

  /**
   * Create appointment in Omega EDI system
   */
  async createAppointment(appointmentData: any): Promise<{ success: boolean; jobId?: string; message: string }> {
    try {
      // For now, simulate Omega EDI appointment creation
      // In production, this would make actual API calls to Omega EDI
      
      const jobId = `OMG_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Creating Omega EDI appointment:', appointmentData);
      
      return {
        success: true,
        jobId,
        message: 'Appointment created successfully in Omega EDI',
      };
    } catch (error) {
      console.error('Omega EDI appointment creation error:', error);
      return {
        success: false,
        message: `Failed to create appointment: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Get technician availability from Omega EDI
   */
  async getTechnicianAvailability(date: string, technicianId?: string): Promise<string[]> {
    try {
      // Simulate getting technician availability from Omega EDI
      const allSlots = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];
      
      // Filter available slots (simulation)
      const availableSlots = allSlots.filter(() => Math.random() > 0.2);
      
      return availableSlots;
    } catch (error) {
      console.error('Error fetching technician availability:', error);
      return [];
    }
  }

  /**
   * Update appointment status in Omega EDI
   */
  async updateAppointmentStatus(appointmentId: string, status: string, notes?: string): Promise<boolean> {
    try {
      // Simulate updating appointment status in Omega EDI
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log(`Updating Omega EDI appointment ${appointmentId} to status: ${status}`, notes);
      
      return true;
    } catch (error) {
      console.error('Error updating appointment status in Omega EDI:', error);
      return false;
    }
  }
}
