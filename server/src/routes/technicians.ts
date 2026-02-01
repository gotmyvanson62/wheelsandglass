import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../storage.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Technician interface matching frontend expectations
interface Technician {
  id: number;
  name: string;
  specialty: string;
  status: 'available' | 'busy' | 'offline';
  phone: string;
  email?: string;
  city: string;
  state: string;
  rating?: number;
  certifications?: string[];
  hireDate?: string;
  zipCodes?: string[];  // ZIP codes this technician services
}

// ZIP code prefix to city/state mapping for quick lookup
const ZIP_PREFIX_MAP: Record<string, { city: string; state: string }> = {
  // California
  '900': { city: 'Los Angeles', state: 'CA' },
  '901': { city: 'Los Angeles', state: 'CA' },
  '902': { city: 'Los Angeles', state: 'CA' },
  '941': { city: 'San Francisco', state: 'CA' },
  '940': { city: 'San Francisco', state: 'CA' },
  '921': { city: 'San Diego', state: 'CA' },
  '920': { city: 'San Diego', state: 'CA' },
  '958': { city: 'Sacramento', state: 'CA' },
  '956': { city: 'Sacramento', state: 'CA' },
  // Texas
  '770': { city: 'Houston', state: 'TX' },
  '772': { city: 'Houston', state: 'TX' },
  '750': { city: 'Dallas', state: 'TX' },
  '752': { city: 'Dallas', state: 'TX' },
  '787': { city: 'Austin', state: 'TX' },
  '786': { city: 'Austin', state: 'TX' },
  '782': { city: 'San Antonio', state: 'TX' },
  '781': { city: 'San Antonio', state: 'TX' },
  // Florida
  '331': { city: 'Miami', state: 'FL' },
  '330': { city: 'Miami', state: 'FL' },
  '328': { city: 'Orlando', state: 'FL' },
  '327': { city: 'Orlando', state: 'FL' },
  '336': { city: 'Tampa', state: 'FL' },
  '335': { city: 'Tampa', state: 'FL' },
  // Arizona
  '850': { city: 'Phoenix', state: 'AZ' },
  '852': { city: 'Phoenix', state: 'AZ' },
  '857': { city: 'Tucson', state: 'AZ' },
  '856': { city: 'Tucson', state: 'AZ' },
  // Nevada
  '891': { city: 'Las Vegas', state: 'NV' },
  '890': { city: 'Las Vegas', state: 'NV' },
  '895': { city: 'Reno', state: 'NV' },
  '894': { city: 'Reno', state: 'NV' },
  // Colorado
  '802': { city: 'Denver', state: 'CO' },
  '800': { city: 'Denver', state: 'CO' },
};

// Helper function to find city/state from ZIP code
function findCityByZip(zip: string): { city: string; state: string } | null {
  const prefix = zip.substring(0, 3);
  return ZIP_PREFIX_MAP[prefix] || null;
}

// In-memory technician data store
// NOTE: In production, technicians should be loaded from the database
const techniciansStore: Map<number, Technician> = new Map();
let nextTechnicianId = 1;

// No seed data - technicians must be enrolled through the system
console.log('[TECHNICIANS] Initialized with 0 technicians (production mode)');

/**
 * GET /api/technicians/coverage-stats
 * PUBLIC endpoint (no auth) - Returns technician counts for coverage maps
 * NOTE: This route MUST be defined before /:id routes to avoid Express matching "coverage-stats" as an ID
 */
router.get('/coverage-stats', async (req: Request, res: Response) => {
  try {
    const technicians = Array.from(techniciansStore.values());

    // Aggregate by state
    const byState: Record<string, { technicians: number; available: number; cities: Set<string> }> = {};

    technicians.forEach(t => {
      if (!byState[t.state]) {
        byState[t.state] = { technicians: 0, available: 0, cities: new Set() };
      }
      byState[t.state].technicians++;
      if (t.status === 'available') byState[t.state].available++;
      byState[t.state].cities.add(t.city);
    });

    res.json({
      success: true,
      data: Object.entries(byState).map(([state, data]) => ({
        state,
        technicians: data.technicians,
        available: data.available,
        cities: data.cities.size
      })),
      totalTechnicians: technicians.length,
      totalAvailable: technicians.filter(t => t.status === 'available').length
    });
  } catch (error) {
    console.error('Error fetching coverage stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch coverage stats'
    });
  }
});

/**
 * GET /api/technicians/stats
 * Get technician statistics by state (protected)
 * NOTE: This route must be defined before /:id to avoid matching "stats" as an ID
 */
router.get('/stats', authMiddleware, async (req: Request, res: Response) => {
  try {
    const technicians = Array.from(techniciansStore.values());

    // Group by state
    const byState: Record<string, { total: number; available: number; busy: number; offline: number; cities: Set<string> }> = {};

    technicians.forEach(t => {
      if (!byState[t.state]) {
        byState[t.state] = { total: 0, available: 0, busy: 0, offline: 0, cities: new Set() };
      }
      byState[t.state].total++;
      byState[t.state][t.status]++;
      byState[t.state].cities.add(t.city);
    });

    // Convert to response format
    const stats = Object.entries(byState).map(([state, data]) => ({
      state,
      total: data.total,
      available: data.available,
      busy: data.busy,
      offline: data.offline,
      cities: data.cities.size
    }));

    stats.sort((a, b) => b.total - a.total);

    res.json({
      success: true,
      data: {
        totalTechnicians: technicians.length,
        totalStates: stats.length,
        totalAvailable: technicians.filter(t => t.status === 'available').length,
        byState: stats
      }
    });

  } catch (error) {
    console.error('Error fetching technician stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/technicians/by-location
 * Get technicians by state and optionally city (protected)
 * NOTE: This route must be defined before /:id to avoid matching "by-location" as an ID
 */
router.get('/by-location', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { state, city } = req.query;

    if (!state) {
      return res.status(400).json({ error: 'State parameter is required' });
    }

    let technicians = Array.from(techniciansStore.values()).filter(t =>
      t.state.toLowerCase() === (state as string).toLowerCase() ||
      t.state === state
    );

    if (city && typeof city === 'string') {
      technicians = technicians.filter(t =>
        t.city.toLowerCase() === city.toLowerCase()
      );
    }

    // Sort by status
    const statusOrder = { available: 0, busy: 1, offline: 2 };
    technicians.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

    res.json({
      success: true,
      data: {
        technicians,
        total: technicians.length,
        state,
        city: city || 'all'
      }
    });

  } catch (error) {
    console.error('Error fetching technicians by location:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch technicians',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/technicians/by-zip/:zip
 * Find technicians by ZIP code
 * NOTE: This route must be defined before /:id to avoid matching "by-zip" as an ID
 */
router.get('/by-zip/:zip', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { zip } = req.params;

    if (!zip || zip.length < 5) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ZIP code - must be at least 5 digits'
      });
    }

    const technicians = Array.from(techniciansStore.values());

    // Strategy 1: Find technicians with exact ZIP code in their service area
    let matching = technicians.filter(tech =>
      tech.zipCodes && tech.zipCodes.includes(zip)
    );

    // Strategy 2: If no exact match, find by city/state using ZIP prefix
    if (matching.length === 0) {
      const cityData = findCityByZip(zip);
      if (cityData) {
        matching = technicians.filter(tech =>
          tech.city.toLowerCase() === cityData.city.toLowerCase() &&
          tech.state === cityData.state
        );
      }
    }

    // Sort by: availability first, then by rating
    const statusOrder = { available: 0, busy: 1, offline: 2 };
    matching.sort((a, b) => {
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) return statusDiff;
      return (b.rating || 0) - (a.rating || 0);
    });

    res.json({
      success: true,
      data: {
        technicians: matching,
        total: matching.length,
        zip,
        matchType: matching.length > 0 ? 'zip_match' : 'no_match'
      }
    });

  } catch (error) {
    console.error('Error fetching technicians by ZIP:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch technicians by ZIP',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/technicians
 * List all technicians with optional filters (protected)
 */
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { state, city, status, search, limit = '50', offset = '0' } = req.query;

    let technicians = Array.from(techniciansStore.values());

    // Filter by state
    if (state && typeof state === 'string') {
      technicians = technicians.filter(t =>
        t.state.toLowerCase() === state.toLowerCase() ||
        t.state === state
      );
    }

    // Filter by city
    if (city && typeof city === 'string') {
      technicians = technicians.filter(t =>
        t.city.toLowerCase() === city.toLowerCase()
      );
    }

    // Filter by status
    if (status && typeof status === 'string') {
      technicians = technicians.filter(t => t.status === status);
    }

    // Search by name or specialty
    if (search && typeof search === 'string') {
      const searchLower = search.toLowerCase();
      technicians = technicians.filter(t =>
        t.name.toLowerCase().includes(searchLower) ||
        t.specialty.toLowerCase().includes(searchLower)
      );
    }

    // Sort by status: available first, then busy, then offline
    const statusOrder = { available: 0, busy: 1, offline: 2 };
    technicians.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

    // Apply pagination
    const limitNum = parseInt(limit as string) || 50;
    const offsetNum = parseInt(offset as string) || 0;
    const paginatedTechnicians = technicians.slice(offsetNum, offsetNum + limitNum);

    res.json({
      success: true,
      data: {
        technicians: paginatedTechnicians,
        total: technicians.length,
        limit: limitNum,
        offset: offsetNum
      }
    });

  } catch (error) {
    console.error('Error fetching technicians:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch technicians',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/technicians/:id
 * Get a single technician by ID (protected)
 * NOTE: This route MUST come after all named routes (/stats, /by-location, /coverage-stats, etc.)
 */
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid technician ID' });
    }

    const technician = techniciansStore.get(id);

    if (!technician) {
      return res.status(404).json({ success: false, error: 'Technician not found' });
    }

    res.json({ success: true, data: technician });

  } catch (error) {
    console.error('Error fetching technician:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch technician',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PATCH /api/technicians/:id/status
 * Update technician status (protected)
 */
router.patch('/:id/status', authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid technician ID' });
    }

    const technician = techniciansStore.get(id);

    if (!technician) {
      return res.status(404).json({ error: 'Technician not found' });
    }

    const statusSchema = z.object({
      status: z.enum(['available', 'busy', 'offline'])
    });

    const validationResult = statusSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors
      });
    }

    technician.status = validationResult.data.status;
    techniciansStore.set(id, technician);

    // Log the activity
    await storage.createActivityLog({
      type: 'technician_status_updated',
      message: `Technician ${technician.name} status changed to ${technician.status}`,
      details: {
        technicianId: id,
        newStatus: technician.status
      }
    });

    res.json({
      success: true,
      data: technician
    });

  } catch (error) {
    console.error('Error updating technician status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update technician status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Export the technicians store for use by other modules (e.g., auto-assignment)
export { techniciansStore };
export type { Technician };

export default router;
