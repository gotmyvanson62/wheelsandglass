import { Router, Request, Response } from 'express';
import { storage } from '../storage.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

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
 * Unified contacts endpoint - aggregates customers, technicians, and distributors (protected)
 */
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { type, search, status, limit = '100', offset = '0' } = req.query;

    let contacts: UnifiedContact[] = [];

    // Fetch customers if no type filter or type is customer
    if (!type || type === 'customer') {
      try {
        const customers = await storage.getCustomers();
        contacts.push(...customers.map((c: any) => ({
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

    // Fetch technicians if no type filter or type is technician
    if (!type || type === 'technician') {
      try {
        const technicians = await storage.getActiveTechnicians();
        contacts.push(...technicians.map((t: any) => ({
          id: t.id,
          type: 'technician' as const,
          name: t.name,
          email: t.email,
          phone: t.phone || '',
          status: (t.isActive ? 'active' : 'inactive') as 'active' | 'pending' | 'inactive',
          specialty: Array.isArray(t.certifications) ? t.certifications.join(', ') : undefined,
          city: Array.isArray(t.serviceAreas) && t.serviceAreas.length > 0 ? t.serviceAreas[0] : undefined,
        })));
      } catch (e) {
        console.log('Could not fetch technicians:', e);
      }
    }

    // Distributors are customers with accountType='distributor'
    // They are already included in the customers fetch above

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
 * Get contact statistics by type (protected)
 */
router.get('/stats', authMiddleware, async (req: Request, res: Response) => {
  try {
    let customerCount = 0;
    let technicianCount = 0;
    let distributorCount = 0;

    try {
      const customers = await storage.getCustomers();
      customerCount = customers.filter((c: any) => c.accountType !== 'distributor').length;
      distributorCount = customers.filter((c: any) => c.accountType === 'distributor').length;
    } catch (e) {
      // Continue with 0
    }

    try {
      const technicians = await storage.getActiveTechnicians();
      technicianCount = technicians.length;
    } catch (e) {
      // Continue with 0
    }

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

/**
 * POST /api/contacts
 * Create a new contact (customer, technician, or distributor) (protected)
 */
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { type, name, email, phone, company, city, state, specialty } = req.body;

    // Validate required fields
    if (!type || !name) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Type and name are required'
      });
    }

    // Validate type
    if (!['customer', 'technician', 'distributor'].includes(type)) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Type must be customer, technician, or distributor'
      });
    }

    let createdContact: UnifiedContact | null = null;

    if (type === 'customer') {
      // Parse name into first/last
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || name;
      const lastName = nameParts.slice(1).join(' ') || '';

      const customer = await storage.createCustomer({
        firstName,
        lastName,
        primaryEmail: email || '',
        primaryPhone: phone || '',
        company: company || null,
        status: 'active',
        accountType: 'individual',
        city: city || null,
        state: state || null,
        totalJobs: 0,
        totalSpent: 0,
        notes: null
      });

      createdContact = {
        id: customer.id,
        type: 'customer',
        name: `${customer.firstName} ${customer.lastName}`,
        email: customer.primaryEmail,
        phone: customer.primaryPhone,
        company: customer.company || undefined,
        status: 'active'
      };
    } else if (type === 'technician') {
      // Create a technician record in the technicians table
      const technician = await storage.createTechnician({
        name: name,
        email: email || '',
        phone: phone || null,
        isActive: true,
        certifications: specialty ? [specialty] : null,
        serviceAreas: city && state ? [`${city}, ${state}`] : null,
        maxDailyJobs: 6,
      });

      createdContact = {
        id: technician.id,
        type: 'technician',
        name: technician.name,
        email: technician.email,
        phone: technician.phone || '',
        city: city || undefined,
        state: state || undefined,
        specialty: specialty || undefined,
        status: technician.isActive ? 'active' : 'inactive'
      };
    } else if (type === 'distributor') {
      // For distributors, create as a customer with distributor account type
      const distributor = await storage.createCustomer({
        firstName: name,
        lastName: '(Distributor)',
        primaryEmail: email || '',
        primaryPhone: phone || '',
        company: company || name,
        status: 'active',
        accountType: 'distributor',
        city: city || null,
        state: state || null,
        totalJobs: 0,
        totalSpent: 0,
        notes: 'Distributor contact'
      });

      createdContact = {
        id: distributor.id,
        type: 'distributor',
        name: distributor.company || name,
        email: distributor.primaryEmail,
        phone: distributor.primaryPhone,
        company: distributor.company || undefined,
        status: 'active'
      };
    }

    if (!createdContact) {
      return res.status(500).json({
        error: 'Failed to create contact',
        message: 'Contact creation returned null'
      });
    }

    // Log the activity
    await storage.createActivityLog({
      type: 'contact_created',
      message: `New ${type} created: ${name}`,
      details: { contactType: type, contactId: createdContact.id, name }
    });

    res.status(201).json({
      success: true,
      contact: createdContact
    });

  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({
      error: 'Failed to create contact',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
