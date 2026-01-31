import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../storage.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Validation schema for payment creation
const createPaymentSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  transactionId: z.number().optional(),
  customerId: z.number().optional(),
  method: z.enum(['cash', 'card', 'check', 'square', 'other']).optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

// GET /api/payments - List payments (protected)
router.get('/', authMiddleware, async (_req: Request, res: Response) => {
  try {
    // Extract payments from successful transactions
    const transactions = await storage.getTransactions();
    const RPJ_DEFAULT = 27500; // $275.00 in cents

    const payments = transactions
      .filter(t => t.status === 'success')
      .map(t => ({
        id: t.id,
        transactionId: t.id,
        customerId: t.customerId,
        customerName: t.customerName,
        customerEmail: t.customerEmail,
        amount: t.amount || RPJ_DEFAULT,
        method: 'card',
        status: t.paymentStatus || 'completed',
        createdAt: t.createdAt || t.timestamp,
      }));

    res.json({ success: true, data: payments });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// GET /api/payments/:id (protected)
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const transaction = await storage.getTransaction(id);
    const RPJ_DEFAULT = 27500; // $275.00 in cents

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Payment not found' }
      });
    }

    res.json({
      success: true,
      data: {
        id: transaction.id,
        transactionId: transaction.id,
        customerId: transaction.customerId,
        amount: transaction.amount || RPJ_DEFAULT,
        method: 'card',
        status: transaction.paymentStatus || transaction.status,
        customerName: transaction.customerName,
        customerEmail: transaction.customerEmail,
        createdAt: transaction.createdAt || transaction.timestamp,
      }
    });
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
});

// POST /api/payments - Create payment (protected)
// Updates customer totals when customerId is provided
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = createPaymentSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationResult.error.errors
      });
    }

    const paymentData = validationResult.data;

    // If there's a linked transaction, update its payment status
    if (paymentData.transactionId) {
      const transaction = await storage.getTransaction(paymentData.transactionId);
      if (transaction) {
        await storage.updateTransaction(paymentData.transactionId, {
          paymentStatus: 'paid',
          finalPrice: paymentData.amount,
        });
      }
    }

    // Update customer totals if customerId is provided
    let updatedCustomer = null;
    if (paymentData.customerId) {
      updatedCustomer = await storage.recalculateCustomerTotals(paymentData.customerId);
      console.log(`[PAYMENT] Updated customer ${paymentData.customerId} totals:`, {
        totalSpent: updatedCustomer?.totalSpent,
        totalJobs: updatedCustomer?.totalJobs,
        lastJobDate: updatedCustomer?.lastJobDate,
      });
    }

    await storage.createActivityLog({
      type: 'payment_created',
      message: `Payment received for $${(paymentData.amount / 100).toFixed(2)}${paymentData.customerId ? ` - Customer #${paymentData.customerId} totals updated` : ''}`,
      details: {
        ...paymentData,
        customerTotalsUpdated: !!updatedCustomer,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Payment recorded',
      customerTotalsUpdated: !!updatedCustomer,
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

export default router;
