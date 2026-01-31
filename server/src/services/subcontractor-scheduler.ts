import axios from 'axios';
import type { 
  InsertJobRequest, 
  InsertSubcontractorResponse, 
  JobRequest, 
  Subcontractor, 
  SubcontractorAvailability,
  NagsPart 
} from '@shared/schema';
import { storage } from '../storage.js';

export interface SchedulingRequest {
  transactionId: number;
  vin: string;
  nagsPartId: number;
  customerLocation: string; // zip code or address
  preferredDate?: Date;
  preferredTimeSlot?: string;
  glassType: string;
  serviceType: string;
  specialInstructions?: string;
}

export interface AvailableSlot {
  subcontractorId: number;
  subcontractorName: string;
  availableDate: Date;
  timeSlot: string;
  rating: number;
  estimatedPrice: number;
  distance: number; // miles from customer
  specialties: string[];
}

export interface SchedulingResult {
  jobRequestId: number;
  availableSlots: AvailableSlot[];
  recommendedSlot?: AvailableSlot;
  estimatedResponseTime: number; // hours
}

export class SubcontractorSchedulerService {
  async createJobRequest(request: SchedulingRequest): Promise<SchedulingResult> {
    // Create job request record
    const jobRequest = await storage.createJobRequest({
      transactionId: request.transactionId,
      vin: request.vin,
      nagsPartId: request.nagsPartId,
      customerLocation: request.customerLocation,
      preferredDate: request.preferredDate || null,
      preferredTimeSlot: request.preferredTimeSlot || null,
      status: 'pending',
      assignedSubcontractorId: null,
      estimatedDuration: this.getEstimatedDuration(request.glassType),
      specialInstructions: request.specialInstructions || null,
    });

    // Find available subcontractors
    const availableSlots = await this.findAvailableSubcontractors(
      request.customerLocation,
      request.preferredDate,
      request.glassType
    );

    // Send requests to subcontractors
    await this.notifySubcontractors(jobRequest.id, availableSlots.map(slot => slot.subcontractorId));

    // Find recommended slot (best rating + closest distance)
    const recommendedSlot = this.selectRecommendedSlot(availableSlots);

    return {
      jobRequestId: jobRequest.id,
      availableSlots,
      recommendedSlot,
      estimatedResponseTime: 24 // hours
    };
  }

  private async findAvailableSubcontractors(
    customerLocation: string,
    preferredDate?: Date,
    glassType?: string
  ): Promise<AvailableSlot[]> {
    // Get all active subcontractors
    const subcontractors = await storage.getActiveSubcontractors();
    
    // Filter by service area and specialties
    const eligibleSubcontractors = subcontractors.filter(sub => {
      // Check service area (simplified - would use proper geolocation in production)
      const serviceAreas = sub.serviceAreas as string[] || [];
      const customerZip = this.extractZipCode(customerLocation);
      const inServiceArea = serviceAreas.length === 0 || serviceAreas.some(area => 
        customerZip.startsWith(area.slice(0, 3)) // Match first 3 digits of zip
      );

      // Check specialties
      const specialties = sub.specialties as string[] || [];
      const hasSpecialty = specialties.length === 0 || 
        specialties.some(specialty => specialty.toLowerCase().includes(glassType?.toLowerCase() || ''));

      return inServiceArea && hasSpecialty;
    });

    // Get availability for each eligible subcontractor
    const availableSlots: AvailableSlot[] = [];
    const targetDate = preferredDate || new Date();

    for (const subcontractor of eligibleSubcontractors) {
      const availability = await storage.getSubcontractorAvailability(
        subcontractor.id,
        targetDate
      );

      if (availability && availability.isAvailable && availability.currentJobs < availability.maxJobs) {
        const timeSlots = availability.timeSlots as string[] || ['09:00', '13:00'];
        
        timeSlots.forEach(timeSlot => {
          availableSlots.push({
            subcontractorId: subcontractor.id,
            subcontractorName: subcontractor.name,
            availableDate: targetDate,
            timeSlot,
            rating: subcontractor.rating,
            estimatedPrice: this.estimatePrice(glassType || ''),
            distance: this.calculateDistance(customerLocation, subcontractor.serviceAreas as string[]),
            specialties: subcontractor.specialties as string[] || []
          });
        });
      }
    }

    return availableSlots.sort((a, b) => {
      // Sort by rating (desc) then distance (asc)
      if (a.rating !== b.rating) return b.rating - a.rating;
      return a.distance - b.distance;
    });
  }

  private selectRecommendedSlot(slots: AvailableSlot[]): AvailableSlot | undefined {
    if (slots.length === 0) return undefined;
    
    // Score based on rating (40%), distance (40%), and time preference (20%)
    return slots.reduce((best, current) => {
      const bestScore = (best.rating * 0.4) + ((50 - best.distance) * 0.004) + 
        (best.timeSlot === '09:00' ? 0.2 : 0);
      const currentScore = (current.rating * 0.4) + ((50 - current.distance) * 0.004) + 
        (current.timeSlot === '09:00' ? 0.2 : 0);
      
      return currentScore > bestScore ? current : best;
    });
  }

  private async notifySubcontractors(jobRequestId: number, subcontractorIds: number[]): Promise<void> {
    const jobRequest = await storage.getJobRequest(jobRequestId);
    if (!jobRequest) return;

    // Get job details for notification
    const transaction = await storage.getTransaction(jobRequest.transactionId);
    const nagsPart = await storage.getNagsPart(jobRequest.nagsPartId);

    const notificationData = {
      jobRequestId,
      customerLocation: jobRequest.customerLocation,
      vehicleInfo: `${transaction?.vehicleYear} ${transaction?.vehicleMake} ${transaction?.vehicleModel}`,
      serviceType: nagsPart?.glassType,
      partNumber: nagsPart?.nagsNumber,
      preferredDate: jobRequest.preferredDate,
      estimatedDuration: jobRequest.estimatedDuration,
      specialInstructions: jobRequest.specialInstructions
    };

    // Send notifications to each subcontractor
    for (const subcontractorId of subcontractorIds) {
      try {
        await this.sendSubcontractorNotification(subcontractorId, notificationData);
        
        // Log notification sent
        await storage.createActivityLog({
          type: 'subcontractor_notified',
          message: `Job request sent to subcontractor ${subcontractorId}`,
          transactionId: jobRequest.transactionId,
          details: { jobRequestId, subcontractorId }
        });
      } catch (error) {
        console.error(`Failed to notify subcontractor ${subcontractorId}:`, error);
      }
    }
  }

  private async sendSubcontractorNotification(subcontractorId: number, jobData: any): Promise<void> {
    const subcontractor = await storage.getSubcontractor(subcontractorId);
    if (!subcontractor) return;

    // In production, this would send email/SMS/push notification
    // For now, we'll just log it
    console.log(`Notification sent to ${subcontractor.name} (${subcontractor.email}):`, jobData);
    
    // Could integrate with email service like:
    // await emailService.sendJobRequest(subcontractor.email, jobData);
    // await smsService.sendJobAlert(subcontractor.phone, jobData);
  }

  async recordSubcontractorResponse(
    jobRequestId: number,
    subcontractorId: number,
    response: 'available' | 'declined' | 'counter_offer',
    availableTimeSlots?: string[],
    proposedDate?: Date,
    notes?: string
  ): Promise<void> {
    await storage.createSubcontractorResponse({
      jobRequestId,
      subcontractorId,
      response,
      availableTimeSlots: availableTimeSlots || null,
      proposedDate: proposedDate || null,
      notes: notes || null,
    });

    // If this is an acceptance, check if it's the best option and potentially assign
    if (response === 'available') {
      await this.evaluateAndAssignJob(jobRequestId);
    }
  }

  private async evaluateAndAssignJob(jobRequestId: number): Promise<void> {
    const responses = await storage.getSubcontractorResponsesByJobRequest(jobRequestId);
    const availableResponses = responses.filter(r => r.response === 'available');

    if (availableResponses.length > 0) {
      // Select best subcontractor based on rating and response time
      const bestResponse = availableResponses.reduce((best, current) => {
        const bestSubRating = best.subcontractorId; // Would get actual rating
        const currentSubRating = current.subcontractorId; // Would get actual rating
        return current.respondedAt < best.respondedAt ? current : best;
      });

      // Assign job to best subcontractor
      await storage.updateJobRequest(jobRequestId, {
        status: 'assigned',
        assignedSubcontractorId: bestResponse.subcontractorId
      });

      // Update appointment with scheduled details
      const jobRequest = await storage.getJobRequest(jobRequestId);
      if (jobRequest) {
        await storage.createAppointment({
          transactionId: jobRequest.transactionId,
          omegaJobId: `JOB-${jobRequestId}`,
          customerEmail: '', // Would get from transaction
          customerPhone: null,
          scheduledDate: bestResponse.proposedDate,
          installerAvailability: bestResponse.availableTimeSlots,
          status: 'scheduled',
          calendarInvitationSent: false,
        });
      }
    }
  }

  private getEstimatedDuration(glassType: string): number {
    const durations: { [key: string]: number } = {
      'windshield': 180, // 3 hours
      'side_window': 90,  // 1.5 hours
      'rear_glass': 150,  // 2.5 hours
      'quarter_glass': 120 // 2 hours
    };
    
    return durations[glassType.toLowerCase()] || 120;
  }

  private estimatePrice(glassType: string): number {
    const basePrices: { [key: string]: number } = {
      'windshield': 35000, // $350
      'side_window': 15000, // $150
      'rear_glass': 25000,  // $250
      'quarter_glass': 18000 // $180
    };
    
    return basePrices[glassType.toLowerCase()] || 20000;
  }

  private extractZipCode(location: string): string {
    const zipMatch = location.match(/\b\d{5}\b/);
    return zipMatch ? zipMatch[0] : '00000';
  }

  private calculateDistance(customerLocation: string, serviceAreas: string[]): number {
    // Simplified distance calculation
    // In production, would use proper geolocation APIs
    const customerZip = this.extractZipCode(customerLocation);
    const closestArea = serviceAreas.find(area => 
      Math.abs(parseInt(customerZip) - parseInt(area)) < 1000
    );
    
    return closestArea ? 5 : 25; // Approximate distance in miles
  }

  // Get job status and updates
  async getJobRequestStatus(jobRequestId: number): Promise<any> {
    const jobRequest = await storage.getJobRequest(jobRequestId);
    const responses = await storage.getSubcontractorResponsesByJobRequest(jobRequestId);
    
    return {
      jobRequest,
      responses,
      responseCount: responses.length,
      availableCount: responses.filter(r => r.response === 'available').length
    };
  }
}

export const subcontractorScheduler = new SubcontractorSchedulerService();