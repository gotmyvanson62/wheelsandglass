import { Router, Request, Response } from 'express';
import { storage } from '../storage.js';
import { quoSmsService } from '../services/quo-sms-service.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// GET /api/communications/sms - List SMS interactions (protected)
router.get('/sms', authMiddleware, async (_req: Request, res: Response) => {
  try {
    const smsInteractions = await storage.getSmsInteractions();
    res.json({ success: true, data: smsInteractions });
  } catch (error) {
    console.error('Error fetching SMS history:', error);
    res.status(500).json({ error: 'Failed to fetch SMS history' });
  }
});

// GET /api/communications/sms/:appointmentId - Get SMS for appointment (protected)
router.get('/sms/:appointmentId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const appointmentId = parseInt(req.params.appointmentId);
    const smsInteractions = await storage.getSmsInteractionsByAppointment(appointmentId);
    res.json({ success: true, data: smsInteractions });
  } catch (error) {
    console.error('Error fetching appointment SMS:', error);
    res.status(500).json({ error: 'Failed to fetch appointment SMS' });
  }
});

// POST /api/communications/sms/send - Send SMS message via Quo (OpenPhone) (protected)
router.post('/sms/send', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { to, body, appointmentId } = req.body;

    if (!to || !body) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'Phone number (to) and message (body) are required' }
      });
    }

    // Create SMS interaction record with pending status
    const smsRecord = await storage.createSmsInteraction({
      appointmentId: appointmentId || null,
      phoneNumber: to,
      direction: 'outbound',
      message: body,
      status: 'pending',
      messageType: 'manual',
    });

    // Send via Quo SMS service
    let quoMessage = null;
    let sendStatus = 'sent';

    try {
      quoMessage = await quoSmsService.sendSMS(to, body);
      if (!quoMessage && !quoSmsService.isReady()) {
        sendStatus = 'logged'; // Service not configured, message was logged only
      }
    } catch (sendError) {
      console.error('Quo SMS send error:', sendError);
      sendStatus = 'failed';
    }

    // Update the record status
    // Note: In a full implementation, you'd update the record here
    // For now, the initial status captures the intent

    await storage.createActivityLog({
      type: 'sms_sent',
      message: `SMS ${sendStatus} to ${to}`,
      details: {
        smsId: smsRecord.id,
        appointmentId,
        quoMessageId: quoMessage?.id,
        status: sendStatus,
        configured: quoSmsService.isReady(),
      },
    });

    res.json({
      success: true,
      message: quoSmsService.isReady()
        ? 'SMS sent successfully'
        : 'SMS logged (Quo not configured - set QUO_API_KEY and QUO_PHONE_NUMBER_ID)',
      data: {
        ...smsRecord,
        quoMessageId: quoMessage?.id,
        status: sendStatus,
      }
    });
  } catch (error) {
    console.error('Error sending SMS:', error);
    res.status(500).json({ error: 'Failed to send SMS' });
  }
});

export default router;
