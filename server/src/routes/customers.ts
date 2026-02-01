import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../storage.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// SECURITY: All customer routes require authentication
router.use(authMiddleware);

/**
 * GET /api/customers
 * List all customers with optional search and pagination
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, limit = '50', offset = '0' } = req.query;

    let customers = await storage.getCustomers();

    // Apply search filter
    if (search && typeof search === 'string') {
      const searchLower = search.toLowerCase();
      customers = customers.filter((c: any) =>
        c.firstName.toLowerCase().includes(searchLower) ||
        c.lastName.toLowerCase().includes(searchLower) ||
        c.primaryEmail.toLowerCase().includes(searchLower) ||
        c.primaryPhone.includes(search)
      );
    }

    // Apply pagination
    const limitNum = parseInt(limit as string) || 50;
    const offsetNum = parseInt(offset as string) || 0;
    const paginatedCustomers = customers.slice(offsetNum, offsetNum + limitNum);

    res.json({
      success: true,
      data: {
        customers: paginatedCustomers,
        total: customers.length,
        limit: limitNum,
        offset: offsetNum
      }
    });

  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({
      error: 'Failed to fetch customers',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/customers/:id
 * Get a single customer by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid customer ID' });
    }

    const customer = await storage.getCustomer(id);

    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    res.json({ success: true, data: customer });

  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({
      error: 'Failed to fetch customer',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/customers/:id/history
 * Get full customer history including quotes, appointments, and transactions
 * Essential for warranty tracking and insurance claim handling
 */
router.get('/:id/history', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid customer ID' });
    }

    const customer = await storage.getCustomer(id);

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Get full customer history
    const history = await storage.getCustomerHistory(id);

    res.json({
      success: true,
      data: {
        customer,
        history: {
          quotes: history.quotes,
          appointments: history.appointments,
          transactions: history.transactions,
          summary: {
            totalQuotes: history.quotes.length,
            totalAppointments: history.appointments.length,
            totalTransactions: history.transactions.length,
            totalJobs: customer.totalJobs || 0,
            totalSpent: customer.totalSpent || 0,
            lastJobDate: customer.lastJobDate
          }
        }
      }
    });

  } catch (error) {
    console.error('Error fetching customer history:', error);
    res.status(500).json({
      error: 'Failed to fetch customer history',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/customers
 * Create a new customer
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const customerSchema = z.object({
      firstName: z.string().min(1, 'First name is required'),
      lastName: z.string().min(1, 'Last name is required'),
      primaryEmail: z.string().email('Invalid email address'),
      primaryPhone: z.string().min(1, 'Phone is required'),
      secondaryEmail: z.string().email().optional(),
      alternatePhone: z.string().optional(),
      address: z.string().optional(),
      postalCode: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      smsOptIn: z.boolean().optional(),
      emailOptIn: z.boolean().optional(),
      preferredContactMethod: z.enum(['email', 'phone', 'sms']).optional(),
      tags: z.array(z.string()).optional(),
      notes: z.string().optional(),
      accountType: z.enum(['individual', 'business', 'fleet']).optional(),
      referredBy: z.string().optional(),
    });

    const validationResult = customerSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors
      });
    }

    // Check if customer already exists
    const existingByEmail = await storage.getCustomerByEmail(validationResult.data.primaryEmail);
    if (existingByEmail) {
      return res.status(409).json({
        error: 'Customer with this email already exists',
        customerId: existingByEmail.id
      });
    }

    const customer = await storage.createCustomer(validationResult.data);

    // Log the activity
    await storage.createActivityLog({
      type: 'customer_created',
      message: `New customer created: ${customer.firstName} ${customer.lastName} (${customer.primaryEmail})`,
      details: {
        customerId: customer.id
      }
    });

    res.status(201).json({
      success: true,
      customer
    });

  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({
      error: 'Failed to create customer',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PUT /api/customers/:id
 * Update a customer
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid customer ID' });
    }

    const customer = await storage.getCustomer(id);

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const updateSchema = z.object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      primaryEmail: z.string().email().optional(),
      primaryPhone: z.string().optional(),
      secondaryEmail: z.string().email().optional(),
      alternatePhone: z.string().optional(),
      address: z.string().optional(),
      postalCode: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      smsOptIn: z.boolean().optional(),
      emailOptIn: z.boolean().optional(),
      preferredContactMethod: z.enum(['email', 'phone', 'sms']).optional(),
      tags: z.array(z.string()).optional(),
      notes: z.string().optional(),
      accountType: z.enum(['individual', 'business', 'fleet']).optional(),
      referredBy: z.string().optional(),
    });

    const validationResult = updateSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors
      });
    }

    const updatedCustomer = await storage.updateCustomer(id, validationResult.data);

    // Log the activity
    await storage.createActivityLog({
      type: 'customer_updated',
      message: `Customer updated: ${updatedCustomer?.firstName} ${updatedCustomer?.lastName}`,
      details: {
        customerId: id,
        updates: Object.keys(validationResult.data)
      }
    });

    res.json({
      success: true,
      customer: updatedCustomer
    });

  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({
      error: 'Failed to update customer',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /api/customers/:id
 * Delete a customer
 * SECURITY: Requires authentication
 */
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid customer ID' });
    }

    const success = await storage.deleteCustomer(id);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    await storage.createActivityLog({
      type: 'customer_deleted',
      message: `Customer ${id} deleted`,
      details: { customerId: id }
    });

    res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete customer',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/customers/search/email/:email
 * Find customer by email
 */
router.get('/search/email/:email', async (req: Request, res: Response) => {
  try {
    const { email } = req.params;

    const customer = await storage.getCustomerByEmail(email);

    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    res.json({ success: true, data: customer });

  } catch (error) {
    console.error('Error searching customer by email:', error);
    res.status(500).json({
      error: 'Failed to search customer',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/customers/search/phone/:phone
 * Find customer by phone number
 */
router.get('/search/phone/:phone', async (req: Request, res: Response) => {
  try {
    const { phone } = req.params;

    const customer = await storage.getCustomerByPhone(phone);

    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    res.json({ success: true, data: customer });

  } catch (error) {
    console.error('Error searching customer by phone:', error);
    res.status(500).json({
      error: 'Failed to search customer',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/customers/stats
 * Get customer statistics for dashboard
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const customers = await storage.getCustomers();

    const now = Date.now();
    const dayAgo = now - (24 * 60 * 60 * 1000);
    const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
    const monthAgo = now - (30 * 24 * 60 * 60 * 1000);

    const stats = {
      total: customers.length,
      newLast24Hours: customers.filter((c: any) =>
        new Date(c.createdAt).getTime() > dayAgo
      ).length,
      newLast7Days: customers.filter((c: any) =>
        new Date(c.createdAt).getTime() > weekAgo
      ).length,
      newLast30Days: customers.filter((c: any) =>
        new Date(c.createdAt).getTime() > monthAgo
      ).length,
      byAccountType: {
        individual: customers.filter((c: any) => c.accountType === 'individual').length,
        business: customers.filter((c: any) => c.accountType === 'business').length,
        fleet: customers.filter((c: any) => c.accountType === 'fleet').length,
      },
      totalRevenue: customers.reduce((sum: number, c: any) => sum + (c.totalSpent || 0), 0),
      averageJobsPerCustomer: customers.length > 0
        ? customers.reduce((sum: number, c: any) => sum + (c.totalJobs || 0), 0) / customers.length
        : 0,
    };

    res.json({ success: true, data: stats });

  } catch (error) {
    console.error('Error fetching customer stats:', error);
    res.status(500).json({
      error: 'Failed to fetch customer statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
