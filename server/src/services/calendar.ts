/**
 * Calendar Service - Handles calendar invitation generation and sending
 * Integrates with Omega EDI job creation to automatically send calendar invites
 */

export interface CalendarEvent {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  customerEmail: string;
  customerName: string;
  location?: string;
  omegaJobId: string;
}

export class CalendarService {
  /**
   * Generates an ICS calendar file content
   */
  generateICSContent(event: CalendarEvent): string {
    const formatDate = (date: Date): string => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const uid = `omega-job-${event.omegaJobId}-${Date.now()}`;
    const dtstamp = formatDate(new Date());
    const dtstart = formatDate(event.startTime);
    const dtend = formatDate(event.endTime);

    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Integration Hub//Auto Glass Appointment//EN',
      'METHOD:REQUEST',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART:${dtstart}`,
      `DTEND:${dtend}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description}`,
      `ATTENDEE;CN=${event.customerName};RSVP=TRUE:mailto:${event.customerEmail}`,
      `LOCATION:${event.location || 'Customer Location'}`,
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
  }

  /**
   * Sends calendar invitation via email (would integrate with email service)
   */
  async sendCalendarInvitation(event: CalendarEvent): Promise<boolean> {
    try {
      const icsContent = this.generateICSContent(event);
      
      // For now, log the calendar invitation details
      // In production, this would integrate with an email service like SendGrid, SES, etc.
      console.log('📅 Calendar Invitation Generated:', {
        customer: event.customerEmail,
        jobId: event.omegaJobId,
        datetime: event.startTime.toISOString(),
        icsSize: icsContent.length
      });

      // TODO: Integrate with actual email service
      // await emailService.send({
      //   to: event.customerEmail,
      //   subject: `Auto Glass Appointment - ${event.title}`,
      //   html: this.generateEmailTemplate(event),
      //   attachments: [{
      //     filename: 'appointment.ics',
      //     content: icsContent,
      //     contentType: 'text/calendar'
      //   }]
      // });

      return true;
    } catch (error) {
      console.error('❌ Calendar invitation failed:', error);
      return false;
    }
  }

  /**
   * Generates HTML email template for calendar invitation
   */
  private generateEmailTemplate(event: CalendarEvent): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Auto Glass Appointment Scheduled</h2>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Appointment Details</h3>
            <p><strong>Service:</strong> ${event.title}</p>
            <p><strong>Date & Time:</strong> ${event.startTime.toLocaleDateString()} at ${event.startTime.toLocaleTimeString()}</p>
            <p><strong>Duration:</strong> ${Math.round((event.endTime.getTime() - event.startTime.getTime()) / (1000 * 60))} minutes</p>
            <p><strong>Location:</strong> ${event.location || 'Your Location'}</p>
            <p><strong>Job ID:</strong> ${event.omegaJobId}</p>
          </div>

          <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; border-left: 4px solid #22c55e;">
            <p style="margin: 0;"><strong>Next Steps:</strong></p>
            <ul style="margin: 10px 0;">
              <li>The calendar invitation is attached to this email</li>
              <li>Add it to your calendar to receive reminders</li>
              <li>If you need to reschedule, reply to this email or call us</li>
            </ul>
          </div>

          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            This appointment was automatically scheduled through our integration system.
            Job reference: ${event.omegaJobId}
          </p>
        </body>
      </html>
    `;
  }

  /**
   * Creates calendar event from Omega EDI job data
   */
  createEventFromOmegaJob(jobData: any, customerData: any): CalendarEvent {
    // Default to 2 hours if no duration specified
    const duration = jobData.estimatedDuration || 120; // minutes
    const startTime = new Date(jobData.scheduledDateTime || Date.now() + 24 * 60 * 60 * 1000); // Default to tomorrow
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

    return {
      title: `Auto Glass Service - ${customerData.vehicleMake} ${customerData.vehicleModel}`,
      description: `Auto glass service appointment for ${customerData.vehicleMake} ${customerData.vehicleModel} (${customerData.vehicleYear})\n\nService Details:\n${jobData.serviceDescription || customerData.damageDescription}\n\nJob ID: ${jobData.id}`,
      startTime,
      endTime,
      customerEmail: customerData.customerEmail,
      customerName: customerData.customerName,
      location: customerData.serviceLocation || 'Customer Location',
      omegaJobId: jobData.id
    };
  }
}

export const calendarService = new CalendarService();