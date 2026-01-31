import { storage } from '../storage.js';
import { quoSmsService } from './quo-sms-service.js';
import type {
  Transaction,
  JobRequest,
  SubcontractorResponse,
  InsertSmsInteraction,
  InsertJobRequest,
  InsertSubcontractorResponse
} from '@shared/schema';

export interface SubcontractorSmsRequest {
  customerName: string;
  customerPhone: string;
  vehicleYear?: string | null;
  vehicleMake?: string | null;
  vehicleModel?: string | null;
  serviceAddress: string;
  requestedDate?: string;
  requestedTime?: string;
  damageDescription?: string;
  transactionId: number;
}

export interface SmsJobRequest {
  jobId: string;
  customerInfo: string;
  vehicleInfo: string;
  serviceLocation: string;
  preferredDateTime: string;
  damageType: string;
  estimatedDuration: string;
}

export interface SubcontractorSmsResponse {
  subcontractorPhone: string;
  jobId: string;
  response: 'accept' | 'reject' | 'reschedule';
  proposedDateTime?: string;
  message: string;
}

/**
 * Simple SMS workflow for subcontractors
 * Handles: Job requests, acceptance/rejection, status updates
 */
export class SubcontractorSmsService {
  
  /**
   * Send SMS job request to available subcontractors
   */
  async sendJobRequestSms(request: SubcontractorSmsRequest): Promise<{ success: boolean; jobRequestId: number; sentTo: string[] }> {
    try {
      console.log('📱 Sending SMS job request to subcontractors:', request);

      // Create job request record
      const jobRequest = await storage.createJobRequest({
        transactionId: request.transactionId,
        vin: null, // Not always available from initial form
        nagsPartId: null,
        customerLocation: request.serviceAddress,
        preferredDate: request.requestedDate ? new Date(request.requestedDate) : null,
        preferredTimeSlot: request.requestedTime || null,
        status: 'pending_contractor',
        assignedSubcontractorId: null,
        estimatedDuration: 120, // 2 hours default
        specialInstructions: request.damageDescription || null,
      });

      // Get available subcontractors (simplified - in production would use geolocation)
      const availableSubcontractors = await this.getAvailableSubcontractors(request.serviceAddress);
      
      // Create job request SMS message
      const vehicle = `${request.vehicleYear || ''} ${request.vehicleMake || ''} ${request.vehicleModel || ''}`.trim();
      const smsMessage = this.createJobRequestMessage({
        jobId: `JOB-${jobRequest.id}`,
        customerInfo: `${request.customerName} (${request.customerPhone})`,
        vehicleInfo: vehicle || 'Vehicle details pending',
        serviceLocation: request.serviceAddress,
        preferredDateTime: request.requestedDate && request.requestedTime 
          ? `${request.requestedDate} at ${request.requestedTime}`
          : 'Flexible scheduling',
        damageType: request.damageDescription || 'Auto glass service',
        estimatedDuration: '2 hours'
      });

      // Send SMS to each available subcontractor
      const sentTo: string[] = [];
      for (const subcontractor of availableSubcontractors) {
        try {
          // In production, integrate with SMS service (Twilio, TextMagic, etc.)
          await this.sendSmsMessage(subcontractor.phone, smsMessage);
          sentTo.push(subcontractor.phone);

          // Log SMS interaction
          await storage.createSmsInteraction({
            phoneNumber: subcontractor.phone,
            timestamp: new Date(),
            status: 'sent',
            message: smsMessage,
            appointmentId: null,
            direction: 'outbound',
            messageType: 'job_request',
            processedData: {
              jobRequestId: jobRequest.id,
              subcontractorId: subcontractor.id,
              transactionId: request.transactionId
            }
          });

          console.log(`📤 SMS sent to ${subcontractor.name}: ${subcontractor.phone}`);
        } catch (error) {
          console.error(`❌ Failed to send SMS to ${subcontractor.phone}:`, error);
        }
      }

      return {
        success: true,
        jobRequestId: jobRequest.id,
        sentTo
      };

    } catch (error) {
      console.error('❌ Failed to send job request SMS:', error);
      return {
        success: false,
        jobRequestId: 0,
        sentTo: []
      };
    }
  }

  /**
   * Process inbound SMS response from subcontractor
   */
  async processSubcontractorResponse(phoneNumber: string, message: string): Promise<{ success: boolean; response?: SubcontractorSmsResponse }> {
    try {
      console.log(`📱 Processing subcontractor SMS from ${phoneNumber}: ${message}`);

      // Extract job ID from message
      const jobId = this.extractJobId(message);
      if (!jobId) {
        console.log('⚠️ No job ID found in SMS response');
        return { success: false };
      }

      // Determine response type
      const responseType = this.determineResponseType(message);
      const proposedDateTime = this.extractDateTime(message);

      // Find subcontractor by phone
      const subcontractor = await this.findSubcontractorByPhone(phoneNumber);
      if (!subcontractor) {
        console.log(`⚠️ Unknown subcontractor phone: ${phoneNumber}`);
        return { success: false };
      }

      // Record subcontractor response
      await storage.createSubcontractorResponse({
        subcontractorId: subcontractor.id,
        jobRequestId: parseInt(jobId.replace('JOB-', '')),
        response: responseType,
        availableTimeSlots: proposedDateTime ? [proposedDateTime] : [],
        proposedDate: proposedDateTime ? new Date(proposedDateTime) : null,
        respondedAt: new Date(),
        notes: message
      });

      // Log SMS interaction
      await storage.createSmsInteraction({
        phoneNumber,
        timestamp: new Date(),
        status: 'received',
        message,
        appointmentId: null,
        direction: 'inbound',
        messageType: `contractor_${responseType}`,
        processedData: {
          jobId,
          subcontractorId: subcontractor.id,
          responseType,
          proposedDateTime
        }
      });

      // Send confirmation SMS
      const confirmationMessage = this.createConfirmationMessage(responseType, jobId);
      await this.sendSmsMessage(phoneNumber, confirmationMessage);

      const response: SubcontractorSmsResponse = {
        subcontractorPhone: phoneNumber,
        jobId,
        response: responseType,
        proposedDateTime,
        message
      };

      console.log(`✅ Processed ${responseType} response from ${subcontractor.name}`);
      return { success: true, response };

    } catch (error) {
      console.error('❌ Failed to process subcontractor response:', error);
      return { success: false };
    }
  }

  /**
   * Send appointment start status update SMS
   */
  async sendStatusUpdate(jobRequestId: number, status: 'started' | 'completed' | 'delayed', message?: string): Promise<boolean> {
    try {
      const jobRequest = await storage.getJobRequest(jobRequestId);
      if (!jobRequest || !jobRequest.assignedSubcontractorId) {
        return false;
      }

      const subcontractor = await storage.getSubcontractor(jobRequest.assignedSubcontractorId);
      if (!subcontractor) {
        return false;
      }

      const statusMessage = `JOB-${jobRequestId} ${status.toUpperCase()}: ${message || this.getDefaultStatusMessage(status)}`;
      
      await this.sendSmsMessage(subcontractor.phone, statusMessage);
      
      console.log(`📤 Status update sent to ${subcontractor.name}: ${status}`);
      return true;

    } catch (error) {
      console.error('❌ Failed to send status update:', error);
      return false;
    }
  }

  // Helper methods

  private createJobRequestMessage(job: SmsJobRequest): string {
    return `🔧 NEW JOB: ${job.jobId}
Customer: ${job.customerInfo}
Vehicle: ${job.vehicleInfo}
Location: ${job.serviceLocation}
Preferred: ${job.preferredDateTime}
Service: ${job.damageType}
Duration: ~${job.estimatedDuration}

Reply:
- "ACCEPT ${job.jobId}" to accept
- "REJECT ${job.jobId} [reason]" to decline
- "RESCHEDULE ${job.jobId} [new date/time]" to propose different time`;
  }

  private determineResponseType(message: string): 'accept' | 'reject' | 'reschedule' {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('accept')) return 'accept';
    if (lowerMessage.includes('reject') || lowerMessage.includes('decline')) return 'reject';
    if (lowerMessage.includes('reschedule') || lowerMessage.includes('different time')) return 'reschedule';
    
    return 'reject'; // Default to reject if unclear
  }

  private extractJobId(message: string): string | null {
    const jobMatch = message.match(/JOB-(\d+)/i);
    return jobMatch ? jobMatch[0] : null;
  }

  private extractDateTime(message: string): string | null {
    // Simple datetime extraction (could be enhanced)
    const dateTimePatterns = [
      /(\d{1,2}\/\d{1,2}\/\d{2,4})\s*(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i,
      /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s*(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i,
      /(tomorrow|next week)\s*(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i
    ];

    for (const pattern of dateTimePatterns) {
      const match = message.match(pattern);
      if (match) {
        return `${match[1]} ${match[2]}`;
      }
    }

    return null;
  }

  private createConfirmationMessage(responseType: string, jobId: string): string {
    switch (responseType) {
      case 'accept':
        return `✅ Confirmed: You've ACCEPTED ${jobId}. Customer will be notified. You'll receive appointment details shortly.`;
      case 'reject':
        return `❌ Confirmed: You've DECLINED ${jobId}. We'll find another contractor.`;
      case 'reschedule':
        return `🔄 Confirmed: Your RESCHEDULE request for ${jobId} has been received. We'll check availability and get back to you.`;
      default:
        return `📝 Your response for ${jobId} has been received.`;
    }
  }

  private getDefaultStatusMessage(status: string): string {
    switch (status) {
      case 'started': return 'Technician has arrived and work has begun';
      case 'completed': return 'Job completed successfully';
      case 'delayed': return 'Running slightly behind schedule';
      default: return 'Status update';
    }
  }

  private async getAvailableSubcontractors(serviceLocation: string): Promise<any[]> {
    // Simplified - get all active subcontractors
    // In production, filter by service area, availability, etc.
    try {
      const subcontractors = await storage.getActiveSubcontractors();
      return subcontractors.slice(0, 3); // Limit to 3 for initial requests
    } catch (error) {
      console.error('Failed to get subcontractors:', error);
      return [];
    }
  }

  private async findSubcontractorByPhone(phoneNumber: string): Promise<any | null> {
    try {
      const subcontractors = await storage.getActiveSubcontractors();
      return subcontractors.find(sub => sub.phone === phoneNumber) || null;
    } catch (error) {
      console.error('Failed to find subcontractor:', error);
      return null;
    }
  }

  private async sendSmsMessage(phoneNumber: string, message: string): Promise<boolean> {
    try {
      // Send via Quo (OpenPhone) SMS service
      const result = await quoSmsService.sendSMS(phoneNumber, message);

      if (result) {
        console.log(`📤 SMS sent to ${phoneNumber} via Quo (ID: ${result.id})`);
        return true;
      } else if (!quoSmsService.isReady()) {
        // Quo not configured - message was logged by the service
        console.log(`📝 SMS logged (Quo not configured) to ${phoneNumber}`);
        return true; // Return true since message was logged
      } else {
        console.error(`❌ Quo SMS send failed to ${phoneNumber}`);
        return false;
      }
    } catch (error) {
      console.error('SMS send failed:', error);
      return false;
    }
  }
}

export const subcontractorSmsService = new SubcontractorSmsService();