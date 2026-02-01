import { storage } from '../storage.js';
import { quoSmsService } from './quo-sms-service.js';
import { emailService } from './email.service.js';

const DEFAULT_INTERVAL_MS = parseInt(process.env.FOLLOWUP_INTERVAL_MS || '') || 15 * 60 * 1000; // 15 minutes
const REVIEW_DELAY_HOURS = parseInt(process.env.FOLLOWUP_DELAY_HOURS || '') || 2; // hours

export function startFollowUpAutomation() {
  console.log('[FollowUp] Starting follow-up automation service');

  // Run immediately on start, then on interval
  runFollowUpPass().catch(err => console.error('[FollowUp] Initial run failed:', err));

  setInterval(() => {
    runFollowUpPass().catch(err => console.error('[FollowUp] Scheduled run failed:', err));
  }, DEFAULT_INTERVAL_MS);
}

async function runFollowUpPass() {
  console.log('[FollowUp] Running follow-up pass');

  // Find successful transactions that likely correspond to completed jobs
  const transactions = await storage.getTransactions({ status: 'success', limit: 1000 });

  const now = Date.now();
  const reviewDelayMs = REVIEW_DELAY_HOURS * 60 * 60 * 1000;

  for (const t of transactions) {
    try {
      // Skip if no contact info
      if (!t.customerPhone && !t.customerEmail) continue;

      // Use transaction timestamp as proxy for completion time if no explicit completion field
      const completedAt = (t as any).completionTime ? new Date((t as any).completionTime).getTime() : new Date(t.timestamp).getTime();

      // Only send follow-up if completion happened before the delay window
      if (now - completedAt < reviewDelayMs) continue;

      // Check formData.reviewRequests to avoid duplicates
      const formData = (t as any).formData || {};
      const reviewInfo = (formData as any).reviewRequests || { count: 0 };
      if (reviewInfo.count >= 3) continue; // respect max attempts

      // Send SMS first if phone available
      if (t.customerPhone) {
        const sms = `Thanks ${t.customerName || ''}! We hope your service went well. Please leave us a review: ${process.env.NEXT_PUBLIC_APP_URL}/reviews/${t.id}`;
        try {
          await quoSmsService.sendSMS(t.customerPhone, sms);
          await storage.createSmsInteraction({
            appointmentId: null as any,
            phoneNumber: t.customerPhone,
            direction: 'outbound',
            message: sms,
            messageType: 'review_request',
            processedData: null as any,
            status: 'sent' as any,
            // some storage implementations accept different timestamp shapes
          } as any);
        } catch (smsErr) {
          console.error('[FollowUp] Failed to send review SMS for transaction', t.id, smsErr);
        }
      }

      // Send email if available
      if (t.customerEmail) {
        try {
          await (emailService as any).sendReviewRequest({
            email: t.customerEmail,
            customerName: t.customerName || 'Valued Customer',
            transactionId: t.id,
            reviewUrl: `${process.env.NEXT_PUBLIC_APP_URL}/reviews/${t.id}`
          } as any);
        } catch (emailErr) {
          console.error('[FollowUp] Failed to send review email for transaction', t.id, emailErr);
        }
      }

      // Update transaction.formData.reviewRequests
      const updatedFormData = {
        ...formData,
        reviewRequests: {
          count: (reviewInfo.count || 0) + 1,
          lastSentAt: new Date().toISOString()
        }
      };

      await storage.updateTransaction(t.id, { formData: updatedFormData });

      await storage.createActivityLog({
        type: 'review_request_sent',
        message: `Review request sent (attempt ${(reviewInfo.count || 0) + 1})`,
        transactionId: t.id,
        details: { transactionId: t.id, attempt: (reviewInfo.count || 0) + 1 }
      });

      console.log(`[FollowUp] Review request sent for transaction ${t.id} (attempt ${(reviewInfo.count || 0) + 1})`);
    } catch (err) {
      console.error('[FollowUp] Error processing transaction', t.id, err);
    }
  }
}

export default { startFollowUpAutomation };
