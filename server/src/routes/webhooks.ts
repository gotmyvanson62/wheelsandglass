import { Router, Request, Response } from 'express';
import { storage } from '../storage.js';
import { verifyQuoSignature, verifyTwilioSignature, verifySquareSignature, captureRawBody } from '../middleware/webhook-verification.middleware.js';
import { quoSmsService, QuoMessage } from '../services/quo-sms-service.js';
import { emailService } from '../services/email.service.js';

const router = Router();

// ===== QUO (OPENPHONE) WEBHOOKS =====

interface QuoWebhookPayload {
  id: string;
  object: 'event';
  type: 'message.received' | 'message.delivered' | 'message.failed' | 'call.completed' | 'voicemail.received';
  data: {
    object: QuoMessage;
  };
  createdAt: string;
  apiVersion: string;
}

/**
 * Categorize inbound SMS message content
 */
function categorizeMessage(message: string): string {
  const lower = message.toLowerCase().trim();
  if (['yes', 'confirm', 'ok', 'okay', 'y'].includes(lower)) return 'confirmation';
  if (['no', 'cancel', 'stop', 'n'].includes(lower)) return 'cancellation';
  if (lower.includes('reschedule') || lower.includes('change')) return 'reschedule';
  if (lower.includes('?')) return 'question';
  return 'general';
}

// POST /api/webhooks/quo-sms - Quo (OpenPhone) SMS webhook
// Apply raw body capture and Quo signature verification
router.post('/quo-sms', captureRawBody, verifyQuoSignature, async (req: Request, res: Response) => {
  const correlationId = `quo-${Date.now()}`;

  try {
    const payload = req.body as QuoWebhookPayload;

    // Log all webhook events
    console.log(`[Webhook:Quo] [${correlationId}] Event: ${payload.type}`);

    await storage.createActivityLog({
      type: 'quo_sms_webhook',
      message: `Quo webhook: ${payload.type}`,
      details: { correlationId, eventId: payload.id, type: payload.type },
    });

    // Only process incoming messages
    if (payload.type !== 'message.received') {
      return res.json({ success: true, message: 'Event acknowledged', correlationId });
    }

    const message = payload.data.object;
    const phoneNumber = message.from;
    const messageContent = message.content || '';
    const messageType = categorizeMessage(messageContent);

    console.log(`[Webhook:Quo] [${correlationId}] Received from ${phoneNumber}: "${messageContent.substring(0, 50)}${messageContent.length > 50 ? '...' : ''}"`);

    // Store SMS interaction
    await storage.createSmsInteraction({
      appointmentId: null,
      phoneNumber,
      direction: 'inbound',
      message: messageContent,
      status: 'received',
      messageType,
    });

    // Handle common responses
    let responseMessage = '';

    const lower = messageContent.toLowerCase().trim();

    if (['yes', 'confirm', 'ok', 'okay', 'y'].includes(lower)) {
      responseMessage = 'Thank you for confirming! We appreciate your feedback.';
    } else if (['no', 'cancel'].includes(lower) || lower.includes('concern') || lower.includes('problem')) {
      responseMessage = "We're sorry to hear that. A team member will reach out shortly to address your concerns.";
    } else if (lower === 'reschedule' || lower.includes('change')) {
      responseMessage = 'To reschedule, please reply with your preferred date and time, or call us at (760) 715-3400.';
    } else if (lower === 'stop' || lower === 'unsubscribe') {
      responseMessage = 'You have been unsubscribed from SMS notifications. Reply START to resubscribe.';
    } else if (lower === 'start') {
      responseMessage = 'You have been resubscribed to SMS notifications.';
    } else {
      responseMessage = 'Thanks for your message! Reply YES to confirm, NO if you have concerns, or RESCHEDULE to change your appointment.';
    }

    // Send reply via Quo API (not TwiML)
    if (responseMessage) {
      try {
        await quoSmsService.sendSMS(phoneNumber, responseMessage);

        // Log outbound response
        await storage.createSmsInteraction({
          appointmentId: null,
          phoneNumber,
          direction: 'outbound',
          message: responseMessage,
          status: 'sent',
          messageType: 'auto_reply',
        });
      } catch (sendError) {
        console.error(`[Webhook:Quo] [${correlationId}] Failed to send reply:`, sendError);
      }
    }

    res.json({ success: true, correlationId });

  } catch (error) {
    console.error(`[Webhook:Quo] [${correlationId}] Error:`, error);
    res.status(500).json({ error: 'Failed to process webhook', correlationId });
  }
});

// ===== SQUARE WEBHOOKS =====

// POST /api/webhooks/square-booking - Square booking webhook
// Apply raw body capture and Square signature verification
// Processes booking.created, booking.updated, and booking.cancelled events
router.post('/square-booking', captureRawBody, verifySquareSignature, async (req: Request, res: Response) => {
  try {
    console.log('Square booking webhook received:', JSON.stringify(req.body, null, 2));

    const eventType = req.body.type;
    const bookingData = req.body.data?.object?.booking;

    // Process booking events
    if (bookingData) {
      const squareBookingId = bookingData.id;
      const bookingVersion = bookingData.version;
      const bookingStatus = bookingData.status; // PENDING, ACCEPTED, DECLINED, CANCELLED_BY_CUSTOMER, CANCELLED_BY_SELLER, NO_SHOW

      console.log(`[SQUARE WEBHOOK] Booking event: ${eventType}, id: ${squareBookingId}, status: ${bookingStatus}`);

      // Find the appointment by Square booking ID
      const appointments = await storage.getAppointments();
      const appointment = appointments.find((a: any) => a.squareBookingId === squareBookingId);

      if (appointment) {
        // Map Square booking status to our appointment status
        let appointmentStatus = appointment.status;
        if (bookingStatus === 'ACCEPTED') appointmentStatus = 'confirmed';
        else if (bookingStatus === 'CANCELLED_BY_CUSTOMER' || bookingStatus === 'CANCELLED_BY_SELLER') appointmentStatus = 'cancelled';
        else if (bookingStatus === 'NO_SHOW') appointmentStatus = 'no_show';
        else if (bookingStatus === 'DECLINED') appointmentStatus = 'cancelled';

        // Update appointment with new status
        await storage.updateAppointment(appointment.id, {
          status: appointmentStatus,
        });

        console.log(`[SQUARE WEBHOOK] Appointment ${appointment.id} updated: status=${appointmentStatus}`);

        await storage.createActivityLog({
          type: 'square_booking_synced',
          message: `Booking ${squareBookingId} synced: status changed to ${appointmentStatus}`,
          details: {
            appointmentId: appointment.id,
            squareBookingId,
            bookingStatus,
            appointmentStatus,
          },
        });
      } else {
        console.log(`[SQUARE WEBHOOK] No appointment found for booking ${squareBookingId}`);
      }
    }

    // Log all webhook events
    await storage.createActivityLog({
      type: 'square_booking_webhook',
      message: `Square booking webhook: ${eventType || 'booking.created'}`,
      details: req.body,
    });

    res.json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    console.error('Square booking webhook error:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

// POST /api/webhooks/square-payment - Square payment webhook
// Apply raw body capture and Square signature verification
// Processes payment.completed events to update transaction status and customer totals
router.post('/square-payment', captureRawBody, verifySquareSignature, async (req: Request, res: Response) => {
  try {
    console.log('Square payment webhook received:', JSON.stringify(req.body, null, 2));

    const eventType = req.body.type;
    const paymentData = req.body.data?.object?.payment;

    // Process payment.completed events
    if (eventType === 'payment.completed' && paymentData) {
      const referenceId = paymentData.reference_id;
      const squarePaymentId = paymentData.id;
      const amountPaid = paymentData.amount_money?.amount || 0;

      console.log(`[SQUARE WEBHOOK] Payment completed: ${squarePaymentId}, ref: ${referenceId}, amount: ${amountPaid}`);

      // Try to find the transaction by reference ID (format: "TXN-{id}" or just the ID)
      let transactionId: number | null = null;
      if (referenceId) {
        // Extract numeric ID from reference (handles "TXN-123" or "123" formats)
        const match = referenceId.match(/(\d+)/);
        if (match) {
          transactionId = parseInt(match[1]);
        }
      }

      if (transactionId) {
        const transaction = await storage.getTransaction(transactionId);
        if (transaction) {
          // Update transaction with payment info
          await storage.updateTransaction(transactionId, {
            paymentStatus: 'paid',
            status: 'success',
            squarePaymentLinkId: squarePaymentId,
            finalPrice: amountPaid,
          });

          console.log(`[SQUARE WEBHOOK] Transaction ${transactionId} updated to paid`);

          // Recalculate customer totals if customer is linked
          if (transaction.customerId) {
            const updatedCustomer = await storage.recalculateCustomerTotals(transaction.customerId);
            console.log(`[SQUARE WEBHOOK] Customer ${transaction.customerId} totals updated:`, {
              totalSpent: updatedCustomer?.totalSpent,
              totalJobs: updatedCustomer?.totalJobs,
            });

            // Send payment receipt email
            if (transaction.customerEmail) {
              emailService.sendPaymentReceipt({
                customerName: transaction.customerName || 'Valued Customer',
                email: transaction.customerEmail,
                transactionId,
                amount: amountPaid,
                paymentMethod: 'Card',
                date: new Date()
              }).catch(err => {
                console.error('Failed to send payment receipt email:', err);
              });
            }
          }

          await storage.createActivityLog({
            type: 'square_payment_completed',
            message: `Payment of $${(amountPaid / 100).toFixed(2)} completed for transaction #${transactionId}`,
            details: {
              transactionId,
              squarePaymentId,
              amountPaid,
              customerId: transaction.customerId,
              customerTotalsUpdated: !!transaction.customerId,
            },
          });
        }
      }
    }

    // Log all webhook events for debugging
    await storage.createActivityLog({
      type: 'square_payment_webhook',
      message: `Square payment webhook: ${eventType || 'unknown'}`,
      details: req.body,
    });

    res.json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    console.error('Square payment webhook error:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

// ===== TWILIO WEBHOOKS (DEPRECATED) =====
// NOTE: Twilio has been replaced with Quo (OpenPhone)
// These endpoints are kept for backward compatibility during migration

// POST /api/webhooks/twilio-sms - Twilio SMS webhook (DEPRECATED)
// @deprecated Use /api/webhooks/quo-sms instead
router.post('/twilio-sms', verifyTwilioSignature, async (req: Request, res: Response) => {
  try {
    console.warn('[DEPRECATED] Twilio webhook called - migrate to Quo at /api/webhooks/quo-sms');
    console.log('Twilio SMS webhook received:', JSON.stringify(req.body, null, 2));

    await storage.createActivityLog({
      type: 'twilio_sms_webhook',
      message: `[DEPRECATED] SMS received from ${req.body.From || 'unknown'}`,
      details: req.body,
    });

    // Create SMS interaction record
    await storage.createSmsInteraction({
      appointmentId: null,
      phoneNumber: req.body.From,
      direction: 'inbound',
      message: req.body.Body,
      status: req.body.SmsStatus || 'received',
      messageType: 'twilio_inbound',
    });

    res.status(200).send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
  } catch (error) {
    console.error('Twilio SMS webhook error:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

// POST /api/webhooks/squarespace-form - Squarespace form submission
router.post('/squarespace-form', async (req: Request, res: Response) => {
  try {
    console.log('Squarespace form webhook received:', JSON.stringify(req.body, null, 2));
    const formData = req.body;

    await storage.createActivityLog({
      type: 'squarespace_form_webhook',
      message: `Form submission from ${formData.customerName || formData.name || 'unknown'}`,
      details: formData,
    });

    // Create transaction record
    const transaction = await storage.createTransaction({
      customerName: formData.customerName || formData.name || 'Unknown',
      customerEmail: formData.customerEmail || formData.email || '',
      customerPhone: formData.customerPhone || formData.phone || '',
      vehicleYear: formData.vehicleYear || '',
      vehicleMake: formData.vehicleMake || '',
      vehicleModel: formData.vehicleModel || '',
      vehicleVin: formData.vehicleVin || formData.vin || '',
      damageDescription: formData.damageDescription || formData.notes || '',
      status: 'pending',
      sourceType: 'squarespace',
      formData: formData,
    });

    res.json({
      success: true,
      message: 'Form processed and job created',
      transactionId: transaction.id
    });
  } catch (error) {
    console.error('Squarespace form webhook error:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

// ===== WEBHOOK EVENTS & ALIASES =====

// GET /api/webhooks/events - List webhook events (from activity logs)
router.get('/events', async (req: Request, res: Response) => {
  try {
    const logs = await storage.getActivityLogs(100);
    const webhookEvents = logs.filter((log: any) =>
      log.type.includes('webhook') ||
      log.type.includes('square') ||
      log.type.includes('quo') ||
      log.type.includes('twilio') // Keep for historical logs
    );

    res.json({ success: true, data: webhookEvents });
  } catch (error) {
    console.error('Error fetching webhook events:', error);
    res.status(500).json({ error: 'Failed to fetch webhook events' });
  }
});

export default router;
