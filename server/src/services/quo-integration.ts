import { storage } from '../storage';
import { quoSmsService } from './quo-sms-service.js';
import type { Transaction, JobRequest, Subcontractor } from '@shared/schema';

export interface QuoChannelConfig {
  channelType: 'sms' | 'voice';
  friendlyName: string;
  uniqueName: string;
  attributes: Record<string, any>;
}

export interface JobTaskAttributes {
  jobRequestId: number;
  transactionId: number;
  customerName: string;
  customerPhone: string;
  vehicleInfo: string;
  serviceLocation: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  skillsRequired: string[];
  estimatedDuration: number;
}

export interface OmegaSmsTemplate {
  templateId: string;
  name: string;
  content: string;
  variables: string[];
  category: 'job_request' | 'status_update' | 'confirmation' | 'reminder';
}

/**
 * Unified communication system integrating Quo (OpenPhone) with Omega EDI SMS templates
 * Replaces previous Twilio Flex integration for subcontractor management
 */
export class QuoIntegrationService {
  private quoPhoneNumberId: string;

  constructor() {
    this.quoPhoneNumberId = process.env.QUO_PHONE_NUMBER_ID || '';
  }

  /**
   * Check if Quo integration is configured
   */
  isReady(): boolean {
    return quoSmsService.isReady();
  }

  /**
   * Create job task for subcontractor assignment with Omega SMS integration
   */
  async createSubcontractorTask(
    jobRequest: JobRequest,
    transaction: Transaction,
    preferredSubcontractors: Subcontractor[]
  ): Promise<{ taskId: string; omegaSmsSent: string[] }> {
    try {
      console.log('🔧 Creating job task for subcontractor assignment');

      // Prepare task attributes
      const taskAttributes: JobTaskAttributes = {
        jobRequestId: jobRequest.id,
        transactionId: transaction.id,
        customerName: transaction.customerName,
        customerPhone: transaction.customerPhone || '',
        vehicleInfo: `${transaction.vehicleYear || ''} ${transaction.vehicleMake || ''} ${transaction.vehicleModel || ''}`.trim(),
        serviceLocation: jobRequest.customerLocation,
        priority: this.determinePriority(transaction, jobRequest),
        skillsRequired: this.extractSkillsRequired(jobRequest),
        estimatedDuration: jobRequest.estimatedDuration || 120
      };

      // Create internal task ID
      const taskId = `task_${jobRequest.id}_${Date.now()}`;

      // Send Omega EDI SMS templates to preferred subcontractors via Quo
      const omegaSmsSent = await this.sendOmegaSmsToSubcontractors(
        jobRequest,
        transaction,
        preferredSubcontractors
      );

      // Log task creation
      await storage.createActivityLog({
        type: 'job_task_created',
        message: `Job task ${taskId} created for ${preferredSubcontractors.length} subcontractors`,
        details: {
          taskId,
          jobRequestId: jobRequest.id,
          transactionId: transaction.id,
          subcontractorCount: preferredSubcontractors.length,
          smsSent: omegaSmsSent.length
        }
      });

      return {
        taskId,
        omegaSmsSent
      };

    } catch (error) {
      console.error('❌ Failed to create job task:', error);
      throw error;
    }
  }

  /**
   * Send SMS using Omega EDI templates with variable substitution via Quo
   */
  private async sendOmegaSmsToSubcontractors(
    jobRequest: JobRequest,
    transaction: Transaction,
    subcontractors: Subcontractor[]
  ): Promise<string[]> {
    const sentTo: string[] = [];

    try {
      // Get Omega SMS template for job requests
      const template = await this.getOmegaSmsTemplate('job_request', 'contractor_assignment');

      for (const subcontractor of subcontractors) {
        // Substitute template variables with actual data
        const smsContent = this.substituteOmegaTemplateVariables(template, {
          contractor_name: subcontractor.name,
          job_id: `WG-${jobRequest.id}`,
          customer_name: transaction.customerName,
          customer_phone: transaction.customerPhone || 'Not provided',
          vehicle_info: `${transaction.vehicleYear || ''} ${transaction.vehicleMake || ''} ${transaction.vehicleModel || ''}`.trim(),
          service_location: jobRequest.customerLocation,
          preferred_date: jobRequest.preferredDate?.toLocaleDateString() || 'Flexible',
          preferred_time: jobRequest.preferredTimeSlot || 'Flexible',
          estimated_duration: `${jobRequest.estimatedDuration || 120} minutes`,
          damage_description: jobRequest.specialInstructions || 'Auto glass service'
        });

        // Send via Quo SMS service
        const quoResult = await quoSmsService.sendSMS(subcontractor.phone, smsContent);

        if (quoResult || !quoSmsService.isReady()) {
          sentTo.push(subcontractor.phone);

          // Log the SMS interaction
          await storage.createSmsInteraction({
            phoneNumber: subcontractor.phone,
            timestamp: new Date(),
            status: quoResult ? 'sent' : 'logged',
            message: smsContent,
            appointmentId: null,
            direction: 'outbound',
            messageType: 'job_request',
            processedData: {
              jobRequestId: jobRequest.id,
              subcontractorId: subcontractor.id,
              templateUsed: template.templateId,
              quoMessageId: quoResult?.id || null
            }
          });
        }
      }

    } catch (error) {
      console.error('❌ Failed to send Omega SMS:', error);
    }

    return sentTo;
  }

  /**
   * Process inbound SMS and update job status
   */
  async processInboundSms(
    fromNumber: string,
    messageBody: string,
    quoMessageId?: string
  ): Promise<{ processed: boolean; action: string; jobRequestId?: number }> {
    try {
      console.log(`📱 Processing inbound SMS from ${fromNumber}: ${messageBody}`);

      // Find subcontractor by phone
      const subcontractor = await this.findSubcontractorByPhone(fromNumber);
      if (!subcontractor) {
        return { processed: false, action: 'unknown_contractor' };
      }

      // Extract job ID and response
      const jobId = this.extractJobIdFromMessage(messageBody);
      const response = this.parseSubcontractorResponse(messageBody);

      if (!jobId || !response) {
        return { processed: false, action: 'invalid_format' };
      }

      // Update job request status
      const jobRequestId = parseInt(jobId.replace('WG-', ''));
      await this.updateJobRequestStatus(jobRequestId, subcontractor.id, response);

      // Send confirmation via Omega template
      const confirmationTemplate = await this.getOmegaSmsTemplate('confirmation', response.type);
      const confirmationMessage = this.substituteOmegaTemplateVariables(confirmationTemplate, {
        contractor_name: subcontractor.name,
        job_id: jobId,
        response_type: response.type,
        proposed_time: response.proposedDateTime || 'N/A'
      });

      await quoSmsService.sendSMS(fromNumber, confirmationMessage);

      // Log the interaction
      await storage.createActivityLog({
        type: 'subcontractor_response',
        message: `Subcontractor ${subcontractor.name} responded to ${jobId}: ${response.type}`,
        details: {
          jobRequestId,
          subcontractorId: subcontractor.id,
          response: response.type,
          quoMessageId
        }
      });

      return {
        processed: true,
        action: response.type,
        jobRequestId
      };

    } catch (error) {
      console.error('❌ Failed to process inbound SMS:', error);
      return { processed: false, action: 'processing_error' };
    }
  }

  /**
   * Get Omega EDI SMS templates with variables
   */
  private async getOmegaSmsTemplate(category: string, templateName: string): Promise<OmegaSmsTemplate> {
    try {
      // In production, fetch from Omega EDI API
      // const response = await axios.get(`${omegaBaseUrl}/sms/templates`, {
      //   headers: { 'api_key': omegaApiKey },
      //   params: { category, name: templateName }
      // });

      // Mock templates for development
      const templates: Record<string, OmegaSmsTemplate> = {
        'job_request_contractor_assignment': {
          templateId: 'OMEGA_JOB_REQ_001',
          name: 'Contractor Job Assignment',
          content: `🔧 NEW JOB: {{job_id}}
Contractor: {{contractor_name}}
Customer: {{customer_name}} ({{customer_phone}})
Vehicle: {{vehicle_info}}
Location: {{service_location}}
Preferred: {{preferred_date}} {{preferred_time}}
Duration: ~{{estimated_duration}}
Service: {{damage_description}}

Reply with:
ACCEPT {{job_id}} - to accept
REJECT {{job_id}} [reason] - to decline
RESCHEDULE {{job_id}} [new time] - to propose different time`,
          variables: ['contractor_name', 'job_id', 'customer_name', 'customer_phone', 'vehicle_info', 'service_location', 'preferred_date', 'preferred_time', 'estimated_duration', 'damage_description'],
          category: 'job_request'
        },
        'confirmation_accept': {
          templateId: 'OMEGA_CONF_ACC_001',
          name: 'Job Acceptance Confirmation',
          content: `✅ {{contractor_name}}, you've ACCEPTED job {{job_id}}. Customer notification sent. Appointment details will follow shortly.`,
          variables: ['contractor_name', 'job_id'],
          category: 'confirmation'
        },
        'confirmation_reject': {
          templateId: 'OMEGA_CONF_REJ_001',
          name: 'Job Rejection Confirmation',
          content: `❌ {{contractor_name}}, you've DECLINED job {{job_id}}. We'll assign it to another contractor.`,
          variables: ['contractor_name', 'job_id'],
          category: 'confirmation'
        },
        'confirmation_reschedule': {
          templateId: 'OMEGA_CONF_RESC_001',
          name: 'Reschedule Request Confirmation',
          content: `🔄 {{contractor_name}}, your reschedule request for {{job_id}} ({{proposed_time}}) received. Checking availability...`,
          variables: ['contractor_name', 'job_id', 'proposed_time'],
          category: 'confirmation'
        }
      };

      const templateKey = `${category}_${templateName}`;
      return templates[templateKey] || templates['job_request_contractor_assignment'];

    } catch (error) {
      console.error('❌ Failed to get Omega SMS template:', error);
      throw error;
    }
  }

  /**
   * Substitute Omega template variables with actual values
   */
  private substituteOmegaTemplateVariables(template: OmegaSmsTemplate, variables: Record<string, string>): string {
    let content = template.content;

    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      content = content.replace(new RegExp(placeholder, 'g'), value || 'N/A');
    }

    return content;
  }

  // Helper methods
  private determinePriority(transaction: Transaction, jobRequest: JobRequest): 'low' | 'normal' | 'high' | 'urgent' {
    if (jobRequest.specialInstructions?.toLowerCase().includes('urgent')) return 'urgent';
    if (jobRequest.preferredDate && new Date(jobRequest.preferredDate) <= new Date(Date.now() + 86400000)) return 'high';
    return 'normal';
  }

  private extractSkillsRequired(jobRequest: JobRequest): string[] {
    const skills = ['auto_glass'];
    if (jobRequest.specialInstructions?.toLowerCase().includes('windshield')) skills.push('windshield');
    if (jobRequest.specialInstructions?.toLowerCase().includes('side window')) skills.push('side_window');
    return skills;
  }

  private async findSubcontractorByPhone(phoneNumber: string): Promise<Subcontractor | null> {
    try {
      const subcontractors = await storage.getActiveSubcontractors();
      return subcontractors.find(sub => sub.phone === phoneNumber) || null;
    } catch (error) {
      return null;
    }
  }

  private extractJobIdFromMessage(message: string): string | null {
    const match = message.match(/WG-(\d+)/i);
    return match ? match[0] : null;
  }

  private parseSubcontractorResponse(message: string): { type: string; proposedDateTime?: string } | null {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('accept')) {
      return { type: 'accept' };
    } else if (lowerMessage.includes('reject') || lowerMessage.includes('decline')) {
      return { type: 'reject' };
    } else if (lowerMessage.includes('reschedule')) {
      const timeMatch = message.match(/(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}:\d{2})/);
      return {
        type: 'reschedule',
        proposedDateTime: timeMatch ? timeMatch[0] : undefined
      };
    }

    return null;
  }

  private async updateJobRequestStatus(jobRequestId: number, subcontractorId: number, response: any): Promise<void> {
    try {
      if (response.type === 'accept') {
        await storage.updateJobRequest(jobRequestId, {
          status: 'assigned',
          assignedSubcontractorId: subcontractorId
        });
      } else if (response.type === 'reject') {
        await storage.updateJobRequest(jobRequestId, {
          status: 'pending_contractor'
        });
      }
    } catch (error) {
      console.error('❌ Failed to update job request status:', error);
    }
  }
}

// Export singleton instance
export const quoIntegrationService = new QuoIntegrationService();

// Re-export for backward compatibility during migration
// TODO: Remove after all consumers are updated
export const twilioFlexService = quoIntegrationService;
