import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../storage.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// In-memory invoice store (will be migrated to database)
interface Invoice {
  id: number;
  transactionId: number;
  invoiceNumber: string;
  invoiceDate: string;
  lineItems: Array<{
    description: string;
    type: 'parts' | 'labor' | 'materials' | 'fee';
    quantity: number;
    unitPrice: number;
    price: number;
  }>;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  status: 'draft' | 'generated' | 'sent' | 'paid' | 'overdue';
  customerName: string;
  customerEmail: string;
  vehicleInfo: string;
  createdAt: string;
  paidAt?: string;
}

const invoicesStore: Map<number, Invoice> = new Map();
let nextInvoiceId = 1;

// Validation schema for line items
const lineItemSchema = z.object({
  description: z.string().min(1),
  type: z.enum(['parts', 'labor', 'materials', 'fee']),
  quantity: z.number().positive().default(1),
  unitPrice: z.number().nonnegative(),
  price: z.number().nonnegative()
});

// Validation schema for invoice generation
const generateInvoiceSchema = z.object({
  transactionId: z.number().positive(),
  lineItems: z.array(lineItemSchema).min(1),
  taxRate: z.number().min(0).max(1).default(0.08)
});

/**
 * POST /api/invoices/generate
 * Generate invoice from a transaction (job)
 */
router.post('/generate', authMiddleware, async (req: Request, res: Response) => {
  try {
    const validationResult = generateInvoiceSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors
      });
    }

    const { transactionId, lineItems, taxRate } = validationResult.data;

    // Get the transaction
    const transaction = await storage.getTransaction(transactionId);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Check if invoice already exists for this transaction
    const existingInvoice = Array.from(invoicesStore.values()).find(
      inv => inv.transactionId === transactionId
    );
    if (existingInvoice) {
      return res.status(400).json({
        error: 'Invoice already exists for this transaction',
        invoiceId: existingInvoice.id,
        invoiceNumber: existingInvoice.invoiceNumber
      });
    }

    // Calculate totals (all amounts in cents)
    const subtotal = lineItems.reduce((sum, item) => sum + item.price, 0);
    const taxAmount = Math.round(subtotal * taxRate);
    const totalAmount = subtotal + taxAmount;

    // Generate invoice number
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(nextInvoiceId).padStart(5, '0')}`;

    // Create invoice record
    const invoice: Invoice = {
      id: nextInvoiceId++,
      transactionId,
      invoiceNumber,
      invoiceDate: new Date().toISOString(),
      lineItems,
      subtotal,
      taxRate,
      taxAmount,
      totalAmount,
      status: 'generated',
      customerName: transaction.customerName || 'Unknown',
      customerEmail: transaction.customerEmail || '',
      vehicleInfo: [transaction.vehicleYear, transaction.vehicleMake, transaction.vehicleModel]
        .filter(Boolean)
        .join(' ') || 'Vehicle',
      createdAt: new Date().toISOString()
    };

    invoicesStore.set(invoice.id, invoice);

    // Update transaction status
    await storage.updateTransaction(transactionId, {
      status: 'invoiced',
      paymentStatus: 'pending'
    });

    // Log activity
    await storage.createActivityLog({
      type: 'invoice_generated',
      message: `Invoice ${invoiceNumber} generated for Job #${transactionId} - Total: $${(totalAmount / 100).toFixed(2)}`,
      details: {
        invoiceId: invoice.id,
        invoiceNumber,
        transactionId,
        subtotal,
        taxAmount,
        totalAmount,
        lineItemCount: lineItems.length
      }
    });

    console.log(`[INVOICES] Invoice ${invoiceNumber} generated for Transaction #${transactionId}`);

    res.json({
      success: true,
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.invoiceDate,
        subtotal: invoice.subtotal,
        taxAmount: invoice.taxAmount,
        totalAmount: invoice.totalAmount,
        status: invoice.status,
        customerName: invoice.customerName,
        vehicleInfo: invoice.vehicleInfo
      }
    });

  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({
      error: 'Failed to generate invoice',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/invoices
 * List all invoices
 */
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { status, limit = '50', offset = '0' } = req.query;

    let invoices = Array.from(invoicesStore.values());

    // Filter by status
    if (status && typeof status === 'string') {
      invoices = invoices.filter(inv => inv.status === status);
    }

    // Sort by date descending
    invoices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Pagination
    const limitNum = parseInt(limit as string);
    const offsetNum = parseInt(offset as string);
    const paginatedInvoices = invoices.slice(offsetNum, offsetNum + limitNum);

    res.json({
      success: true,
      data: paginatedInvoices,
      pagination: {
        total: invoices.length,
        limit: limitNum,
        offset: offsetNum,
        hasMore: offsetNum + limitNum < invoices.length
      }
    });

  } catch (error) {
    console.error('Error listing invoices:', error);
    res.status(500).json({
      error: 'Failed to list invoices',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/invoices/:id
 * Get invoice details
 */
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid invoice ID' });
    }

    const invoice = invoicesStore.get(id);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json({
      success: true,
      data: invoice
    });

  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({
      error: 'Failed to fetch invoice',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/invoices/by-transaction/:transactionId
 * Get invoice for a specific transaction
 */
router.get('/by-transaction/:transactionId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const transactionId = parseInt(req.params.transactionId);

    if (isNaN(transactionId)) {
      return res.status(400).json({ error: 'Invalid transaction ID' });
    }

    const invoice = Array.from(invoicesStore.values()).find(
      inv => inv.transactionId === transactionId
    );

    if (!invoice) {
      return res.status(404).json({ error: 'No invoice found for this transaction' });
    }

    res.json({
      success: true,
      data: invoice
    });

  } catch (error) {
    console.error('Error fetching invoice by transaction:', error);
    res.status(500).json({
      error: 'Failed to fetch invoice',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PATCH /api/invoices/:id/status
 * Update invoice status (e.g., mark as paid)
 */
router.patch('/:id/status', authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid invoice ID' });
    }

    const invoice = invoicesStore.get(id);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const statusSchema = z.object({
      status: z.enum(['draft', 'generated', 'sent', 'paid', 'overdue'])
    });

    const validationResult = statusSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors
      });
    }

    const { status } = validationResult.data;
    const previousStatus = invoice.status;
    invoice.status = status;

    if (status === 'paid') {
      invoice.paidAt = new Date().toISOString();

      // Update transaction payment status
      await storage.updateTransaction(invoice.transactionId, {
        paymentStatus: 'paid'
      });
    }

    invoicesStore.set(id, invoice);

    await storage.createActivityLog({
      type: 'invoice_status_updated',
      message: `Invoice ${invoice.invoiceNumber} status changed from ${previousStatus} to ${status}`,
      details: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        previousStatus,
        newStatus: status
      }
    });

    res.json({
      success: true,
      data: invoice
    });

  } catch (error) {
    console.error('Error updating invoice status:', error);
    res.status(500).json({
      error: 'Failed to update invoice status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
