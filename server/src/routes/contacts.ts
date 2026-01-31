import { Router, Request, Response } from 'express';
import { storage } from '../storage.js';

const router = Router();

// Unified contact interface
interface UnifiedContact {
  id: number;
  type: 'customer' | 'technician' | 'distributor';
  name: string;
  email: string;
  phone: string;
  company?: string;
  status: 'active' | 'pending' | 'inactive';
  // Type-specific fields
  city?: string;
  state?: string;
  specialty?: string;
  accountType?: string;
  totalSpent?: number;
  totalJobs?: number;
  rating?: number;
}

/**
 * GET /api/contacts
 * Unified contacts endpoint - aggregates customers, technicians, and distributors
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { type, search, status, limit = '100', offset = '0' } = req.query;

    let contacts: UnifiedContact[] = [];

    // Fetch customers if no type filter or type is customer
    if (!type || type === 'customer') {
      try {
        const customers = await storage.getCustomers();
        contacts.push(...customers.map(c => ({
          id: c.id,
          type: 'customer' as const,
          name: `${c.firstName} ${c.lastName}`,
          email: c.primaryEmail,
          phone: c.primaryPhone,
          company: c.company || undefined,
          status: (c.status as 'active' | 'pending' | 'inactive') || 'active',
          accountType: c.accountType,
          totalSpent: c.totalSpent,
          totalJobs: c.totalJobs,
        })));
      } catch (e) {
        // Storage might not have customers method, continue with empty
        console.log('Could not fetch customers:', e);
      }
    }

    // Technicians and distributors will be fetched from database in production
    // Currently returns empty for these types until real data is added
    // if (!type || type === 'technician') { ... }
    // if (!type || type === 'distributor') { ... }

    // Apply search filter
    if (search && typeof search === 'string') {
      const searchLower = search.toLowerCase();
      contacts = contacts.filter(c =>
        c.name.toLowerCase().includes(searchLower) ||
        c.email?.toLowerCase().includes(searchLower) ||
        c.phone?.includes(search) ||
        c.company?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (status && typeof status === 'string' && status !== 'all') {
      contacts = contacts.filter(c => c.status === status);
    }

    // Sort: active first, then by name
    const statusOrder = { active: 0, pending: 1, inactive: 2 };
    contacts.sort((a, b) => {
      if (a.status !== b.status) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return a.name.localeCompare(b.name);
    });

    // Apply pagination
    const limitNum = parseInt(limit as string) || 100;
    const offsetNum = parseInt(offset as string) || 0;
    const paginatedContacts = contacts.slice(offsetNum, offsetNum + limitNum);

    res.json({
      contacts: paginatedContacts,
      total: contacts.length,
      limit: limitNum,
      offset: offsetNum
    });

  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({
      error: 'Failed to fetch contacts',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/contacts/stats
 * Get contact statistics by type
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    let customerCount = 0;
    try {
      const customers = await storage.getCustomers();
      customerCount = customers.length;
    } catch (e) {
      // Continue with 0
    }

    // Technicians and distributors will be fetched from database in production
    const technicianCount = 0;
    const distributorCount = 0;

    res.json({
      total: customerCount + technicianCount + distributorCount,
      byType: {
        customer: customerCount,
        technician: technicianCount,
        distributor: distributorCount
      },
      byStatus: {
        active: 0,
        pending: 0,
        inactive: 0
      }
    });

  } catch (error) {
    console.error('Error fetching contact stats:', error);
    res.status(500).json({
      error: 'Failed to fetch contact statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
