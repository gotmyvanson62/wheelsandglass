/**
 * SMS Processor Service - Handles SMS interactions for appointment rescheduling
 * Processes inbound SMS messages, extracts scheduling requests, and coordinates with Omega EDI
 */

import { InsertSmsInteraction, InsertAppointment } from '@shared/schema';

export interface RescheduleRequest {
  originalAppointmentId: number;
  requestedDate?: Date;
  requestedTimeSlot?: string;
  customerPhone: string;
  messageType: 'reschedule_request' | 'availability_inquiry' | 'confirmation';
  extractedData: any;
}

export interface InstallerAvailability {
  installerId: string;
  availableSlots: Array<{
    date: string;
    startTime: string;
    endTime: string;
    duration: number;
  }>;
  nextAvailable: Date;
}

export class SmsProcessorService {
  /**
   * Processes inbound SMS messages and extracts scheduling intent
   */
  async processInboundSms(phoneNumber: string, message: string, appointmentId?: number): Promise<RescheduleRequest | null> {
    try {
      const processedData = this.extractSchedulingIntent(message);
      
      if (!processedData.hasSchedulingIntent) {
        return null;
      }

      const rescheduleRequest: RescheduleRequest = {
        originalAppointmentId: appointmentId || 0,
        requestedDate: processedData.extractedDate,
        requestedTimeSlot: processedData.timeSlot,
        customerPhone: phoneNumber,
        messageType: this.determineMessageType(message),
        extractedData: processedData
      };

      console.log('📱 SMS Reschedule Request Processed:', {
        phone: phoneNumber,
        type: rescheduleRequest.messageType,
        requestedDate: rescheduleRequest.requestedDate?.toISOString(),
        originalMessage: message
      });

      return rescheduleRequest;
    } catch (error) {
      console.error('❌ SMS processing failed:', error);
      return null;
    }
  }

  /**
   * Extracts scheduling intent and date/time information from SMS text
   */
  private extractSchedulingIntent(message: string): any {
    const lowerMessage = message.toLowerCase();
    const hasSchedulingIntent = this.detectSchedulingKeywords(lowerMessage);
    
    if (!hasSchedulingIntent) {
      return { hasSchedulingIntent: false };
    }

    // Extract date patterns
    const datePatterns = [
      /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/g, // MM/DD/YYYY or MM-DD-YYYY
      /(tomorrow|next week|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi,
      /(today|this week)/gi
    ];

    // Extract time patterns
    const timePatterns = [
      /(\d{1,2}):?(\d{2})?\s*(am|pm)/gi,
      /(morning|afternoon|evening|noon)/gi,
      /(\d{1,2})\s*(am|pm)/gi
    ];

    let extractedDate: Date | null = null;
    let timeSlot: string | null = null;

    // Process date patterns
    for (const pattern of datePatterns) {
      const match = pattern.exec(message);
      if (match) {
        extractedDate = this.parseDate(match[0]);
        break;
      }
    }

    // Process time patterns
    for (const pattern of timePatterns) {
      const match = pattern.exec(message);
      if (match) {
        timeSlot = match[0];
        break;
      }
    }

    return {
      hasSchedulingIntent: true,
      extractedDate,
      timeSlot,
      originalMessage: message,
      confidence: this.calculateConfidence(lowerMessage, extractedDate, timeSlot)
    };
  }

  /**
   * Detects scheduling-related keywords in the message
   */
  private detectSchedulingKeywords(message: string): boolean {
    const schedulingKeywords = [
      'reschedule', 'change', 'move', 'different time', 'different date',
      'cancel', 'postpone', 'delay', 'earlier', 'later',
      'available', 'availability', 'when can', 'what time',
      'appointment', 'meeting', 'service call'
    ];

    return schedulingKeywords.some(keyword => message.includes(keyword));
  }

  /**
   * Parses date string into Date object
   */
  private parseDate(dateString: string): Date | null {
    try {
      const today = new Date();
      const lowerDate = dateString.toLowerCase();

      // Handle relative dates
      if (lowerDate.includes('tomorrow')) {
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        return tomorrow;
      }

      if (lowerDate.includes('next week')) {
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        return nextWeek;
      }

      // Handle day names
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      for (let i = 0; i < dayNames.length; i++) {
        if (lowerDate.includes(dayNames[i])) {
          const targetDay = new Date(today);
          const daysUntilTarget = (i - today.getDay() + 7) % 7;
          targetDay.setDate(today.getDate() + (daysUntilTarget === 0 ? 7 : daysUntilTarget));
          return targetDay;
        }
      }

      // Handle MM/DD/YYYY format
      const dateMatch = dateString.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
      if (dateMatch) {
        const month = parseInt(dateMatch[1]) - 1; // JavaScript months are 0-based
        const day = parseInt(dateMatch[2]);
        let year = parseInt(dateMatch[3]);
        
        if (year < 100) {
          year += 2000; // Convert 2-digit year to 4-digit
        }
        
        return new Date(year, month, day);
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Determines the type of SMS message
   */
  private determineMessageType(message: string): 'reschedule_request' | 'availability_inquiry' | 'confirmation' {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('available') || lowerMessage.includes('when can') || lowerMessage.includes('what time')) {
      return 'availability_inquiry';
    }

    if (lowerMessage.includes('confirm') || lowerMessage.includes('yes') || lowerMessage.includes('ok')) {
      return 'confirmation';
    }

    return 'reschedule_request';
  }

  /**
   * Calculates confidence score for extracted scheduling data
   */
  private calculateConfidence(message: string, extractedDate: Date | null, timeSlot: string | null): number {
    let confidence = 0;

    // Base confidence for scheduling keywords
    if (this.detectSchedulingKeywords(message)) {
      confidence += 0.3;
    }

    // Additional confidence for extracted date
    if (extractedDate) {
      confidence += 0.4;
    }

    // Additional confidence for extracted time
    if (timeSlot) {
      confidence += 0.3;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Checks installer availability for requested date/time
   */
  async checkInstallerAvailability(requestedDate: Date, installerId?: string): Promise<InstallerAvailability> {
    // This would integrate with Omega EDI to get real installer availability
    // For now, return mock availability data
    
    const mockAvailability: InstallerAvailability = {
      installerId: installerId || 'default-installer',
      availableSlots: [
        {
          date: requestedDate.toISOString().split('T')[0],
          startTime: '09:00',
          endTime: '11:00',
          duration: 120
        },
        {
          date: requestedDate.toISOString().split('T')[0],
          startTime: '14:00',
          endTime: '16:00',
          duration: 120
        }
      ],
      nextAvailable: new Date(requestedDate.getTime() + 24 * 60 * 60 * 1000)
    };

    console.log('🔍 Installer Availability Check:', {
      requestedDate: requestedDate.toISOString(),
      availableSlots: mockAvailability.availableSlots.length,
      nextAvailable: mockAvailability.nextAvailable.toISOString()
    });

    return mockAvailability;
  }

  /**
   * Generates SMS response based on availability check
   */
  generateSmsResponse(request: RescheduleRequest, availability: InstallerAvailability): string {
    if (request.messageType === 'availability_inquiry') {
      if (availability.availableSlots.length > 0) {
        const slots = availability.availableSlots
          .map(slot => `${slot.startTime}-${slot.endTime}`)
          .join(', ');
        return `We have availability on ${request.requestedDate?.toLocaleDateString()} at: ${slots}. Reply with your preferred time to confirm.`;
      } else {
        return `No availability on ${request.requestedDate?.toLocaleDateString()}. Next available: ${availability.nextAvailable.toLocaleDateString()}. Would this work for you?`;
      }
    }

    if (request.messageType === 'reschedule_request') {
      if (availability.availableSlots.length > 0) {
        return `We can reschedule your appointment to ${request.requestedDate?.toLocaleDateString()}. Available times: ${availability.availableSlots.map(s => s.startTime).join(', ')}. Which time works best?`;
      } else {
        return `${request.requestedDate?.toLocaleDateString()} is not available. Our next opening is ${availability.nextAvailable.toLocaleDateString()}. Would you like to schedule then?`;
      }
    }

    return 'Thank you for your message. We\'ll review your request and get back to you shortly.';
  }

  /**
   * Updates Omega EDI with new appointment time
   */
  async updateOmegaAppointment(omegaJobId: string, newDateTime: Date): Promise<boolean> {
    try {
      // This would make an API call to Omega EDI to update the appointment
      // For now, log the update
      console.log('📅 Omega EDI Update:', {
        jobId: omegaJobId,
        newDateTime: newDateTime.toISOString(),
        action: 'reschedule'
      });

      // TODO: Implement actual Omega EDI API call
      // const response = await omegaEdiService.updateJobSchedule(omegaJobId, newDateTime);
      // return response.success;

      return true;
    } catch (error) {
      console.error('❌ Omega EDI update failed:', error);
      return false;
    }
  }
}

export const smsProcessorService = new SmsProcessorService();