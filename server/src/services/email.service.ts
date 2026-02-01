/**
 * Email Notification Service
 * Handles sending transactional emails for quotes, payments, and appointments
 */

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: {
    name: string;
    email: string;
  };
}

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

interface QuoteConfirmationData {
  customerName: string;
  email: string;
  submissionId: number;
  division: 'glass' | 'wheels';
  serviceType: string;
  vehicleInfo?: {
    year: string;
    make: string;
    model: string;
  };
}

interface PaymentReceiptData {
  customerName: string;
  email: string;
  transactionId: number;
  amount: number;
  paymentMethod: string;
  date: Date;
}

interface AppointmentConfirmationData {
  customerName: string;
  email: string;
  appointmentId: number;
  date: Date;
  time: string;
  location: string;
  serviceType: string;
}

class EmailService {
  private transporter: Transporter | null = null;
  private isConfigured = false;
  private config: EmailConfig | null = null;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587');
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;
    const fromEmail = process.env.SMTP_FROM_EMAIL;
    const fromName = process.env.SMTP_FROM_NAME || 'Wheels and Glass';

    // Check if all required config is present
    if (host && user && pass && fromEmail) {
      this.config = {
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
        from: { name: fromName, email: fromEmail }
      };

      this.transporter = nodemailer.createTransport({
        host: this.config.host,
        port: this.config.port,
        secure: this.config.secure,
        auth: this.config.auth,
        // Connection timeout
        connectionTimeout: 10000,
        // Socket timeout
        socketTimeout: 15000,
      });

      this.isConfigured = true;
      console.log('Email service configured successfully');
    } else {
      console.log('Email service not configured - missing SMTP credentials');
    }
  }

  /**
   * Check if email service is properly configured
   */
  isReady(): boolean {
    return this.isConfigured && this.transporter !== null;
  }

  /**
   * Send a generic email
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.isReady() || !this.transporter || !this.config) {
      console.log('Email service not configured, skipping email');
      return false;
    }

    try {
      const result = await this.transporter.sendMail({
        from: `"${this.config.from.name}" <${this.config.from.email}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html || options.text
      });

      console.log(`Email sent successfully to ${options.to}:`, result.messageId);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  /**
   * Send quote confirmation email to customer
   */
  async sendQuoteConfirmation(data: QuoteConfirmationData): Promise<boolean> {
    const divisionName = data.division === 'wheels' ? 'Wheel Repair' : 'Auto Glass';
    const vehicleText = data.vehicleInfo
      ? `${data.vehicleInfo.year} ${data.vehicleInfo.make} ${data.vehicleInfo.model}`
      : 'your vehicle';

    const subject = `Your ${divisionName} Quote Request #${data.submissionId}`;

    const text = `
Hello ${data.customerName},

Thank you for your ${divisionName.toLowerCase()} quote request!

Quote Details:
- Request ID: #${data.submissionId}
- Service: ${data.serviceType}
- Vehicle: ${vehicleText}

What's Next?
Our team will review your request and contact you within 24 hours with a personalized quote. If you have any questions in the meantime, simply reply to this email.

Thank you for choosing Wheels and Glass!

Best regards,
The Wheels and Glass Team
    `.trim();

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: ${data.division === 'wheels' ? '#f97316' : '#2563eb'}; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
    .details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">Quote Request Received</h1>
    </div>
    <div class="content">
      <p>Hello ${data.customerName},</p>
      <p>Thank you for your ${divisionName.toLowerCase()} quote request!</p>

      <div class="details">
        <h3 style="margin-top: 0;">Quote Details</h3>
        <ul style="padding-left: 20px;">
          <li><strong>Request ID:</strong> #${data.submissionId}</li>
          <li><strong>Service:</strong> ${data.serviceType}</li>
          <li><strong>Vehicle:</strong> ${vehicleText}</li>
        </ul>
      </div>

      <h3>What's Next?</h3>
      <p>Our team will review your request and contact you within 24 hours with a personalized quote. If you have any questions in the meantime, simply reply to this email.</p>

      <div class="footer">
        <p>Thank you for choosing Wheels and Glass!</p>
        <p>Best regards,<br>The Wheels and Glass Team</p>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();

    return this.sendEmail({
      to: data.email,
      subject,
      text,
      html
    });
  }

  /**
   * Send payment receipt email to customer
   */
  async sendPaymentReceipt(data: PaymentReceiptData): Promise<boolean> {
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(data.amount / 100); // Amount in cents

    const formattedDate = data.date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const subject = `Payment Receipt - Transaction #${data.transactionId}`;

    const text = `
Hello ${data.customerName},

Your payment has been processed successfully!

Payment Details:
- Transaction ID: #${data.transactionId}
- Amount: ${formattedAmount}
- Payment Method: ${data.paymentMethod}
- Date: ${formattedDate}

Thank you for your business!

Best regards,
The Wheels and Glass Team
    `.trim();

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #16a34a; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
    .receipt { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; border: 1px solid #e5e7eb; }
    .amount { font-size: 32px; font-weight: bold; color: #16a34a; text-align: center; margin: 20px 0; }
    .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">Payment Confirmed</h1>
    </div>
    <div class="content">
      <p>Hello ${data.customerName},</p>
      <p>Your payment has been processed successfully!</p>

      <div class="receipt">
        <div class="amount">${formattedAmount}</div>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Transaction ID</strong></td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">#${data.transactionId}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Payment Method</strong></td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${data.paymentMethod}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0;"><strong>Date</strong></td>
            <td style="padding: 10px 0; text-align: right;">${formattedDate}</td>
          </tr>
        </table>
      </div>

      <div class="footer">
        <p>Thank you for your business!</p>
        <p>Best regards,<br>The Wheels and Glass Team</p>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();

    return this.sendEmail({
      to: data.email,
      subject,
      text,
      html
    });
  }

  /**
   * Send appointment confirmation email to customer
   */
  async sendAppointmentConfirmation(data: AppointmentConfirmationData): Promise<boolean> {
    const formattedDate = data.date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const subject = `Appointment Confirmed - ${formattedDate}`;

    const text = `
Hello ${data.customerName},

Your appointment has been confirmed!

Appointment Details:
- Date: ${formattedDate}
- Time: ${data.time}
- Location: ${data.location}
- Service: ${data.serviceType}

Important Notes:
- Please be available at the scheduled time
- Have your vehicle accessible for service
- If you need to reschedule, please contact us at least 24 hours in advance

Thank you for choosing Wheels and Glass!

Best regards,
The Wheels and Glass Team
    `.trim();

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
    .appointment { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #2563eb; }
    .date-time { font-size: 24px; font-weight: bold; color: #1e40af; margin-bottom: 10px; }
    .notes { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">Appointment Confirmed</h1>
    </div>
    <div class="content">
      <p>Hello ${data.customerName},</p>
      <p>Your appointment has been confirmed!</p>

      <div class="appointment">
        <div class="date-time">${formattedDate}</div>
        <div class="date-time" style="font-size: 20px;">${data.time}</div>
        <p style="margin: 10px 0 0;"><strong>Location:</strong> ${data.location}</p>
        <p style="margin: 5px 0 0;"><strong>Service:</strong> ${data.serviceType}</p>
      </div>

      <div class="notes">
        <h3 style="margin-top: 0; color: #92400e;">Important Notes</h3>
        <ul style="margin-bottom: 0; padding-left: 20px;">
          <li>Please be available at the scheduled time</li>
          <li>Have your vehicle accessible for service</li>
          <li>If you need to reschedule, please contact us at least 24 hours in advance</li>
        </ul>
      </div>

      <div class="footer">
        <p>Thank you for choosing Wheels and Glass!</p>
        <p>Best regards,<br>The Wheels and Glass Team</p>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();

    return this.sendEmail({
      to: data.email,
      subject,
      text,
      html
    });
  }

  /**
   * Verify email configuration by sending a test email
   */
  async verifyConfiguration(): Promise<boolean> {
    if (!this.isReady() || !this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      console.log('Email service verification successful');
      return true;
    } catch (error) {
      console.error('Email service verification failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();
export default emailService;
