import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../storage.js';

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
}

// In-memory technician data store
const techniciansStore: Map<number, Technician> = new Map();

// Initialize with seed technicians for demo/testing
function initializeTechnicians() {
  const seedData: Technician[] = [
    // California
    { id: 1, name: 'Mike Rodriguez', email: 'mike@wheelsandglass.com', phone: '(213) 555-0142', specialty: 'ADAS & Windshield', city: 'Los Angeles', state: 'CA', status: 'available', rating: 4.9, certifications: ['ADAS Certified', 'OEM Certified'], hireDate: '2022-03-15' },
    { id: 2, name: 'Sarah Kim', email: 'sarah@wheelsandglass.com', phone: '(415) 555-0198', specialty: 'Side Glass', city: 'San Francisco', state: 'CA', status: 'available', rating: 4.8, certifications: ['NGA Certified'], hireDate: '2023-01-10' },
    { id: 3, name: 'David Chen', email: 'david@wheelsandglass.com', phone: '(619) 555-0127', specialty: 'Sunroof & Rear Glass', city: 'San Diego', state: 'CA', status: 'busy', rating: 4.7, certifications: ['OEM Certified'], hireDate: '2022-08-22' },
    { id: 4, name: 'Emily Watson', email: 'emily@wheelsandglass.com', phone: '(916) 555-0156', specialty: 'Windshield', city: 'Sacramento', state: 'CA', status: 'available', rating: 4.6, certifications: ['NGA Certified'], hireDate: '2023-05-01' },
    // Texas
    { id: 5, name: 'Maria Garcia', email: 'maria@wheelsandglass.com', phone: '(713) 555-0165', specialty: 'Windshield', city: 'Houston', state: 'TX', status: 'available', rating: 4.9, certifications: ['ADAS Certified', 'NGA Certified'], hireDate: '2021-11-30' },
    { id: 6, name: 'James Wilson', email: 'james@wheelsandglass.com', phone: '(214) 555-0188', specialty: 'ADAS Calibration', city: 'Dallas', state: 'TX', status: 'available', rating: 4.6, certifications: ['ADAS Certified'], hireDate: '2023-02-14' },
    { id: 7, name: 'Carlos Hernandez', email: 'carlos@wheelsandglass.com', phone: '(512) 555-0133', specialty: 'All Glass Types', city: 'Austin', state: 'TX', status: 'busy', rating: 4.8, certifications: ['OEM Certified', 'NGA Certified'], hireDate: '2022-06-01' },
    { id: 8, name: 'Amanda Johnson', email: 'amanda@wheelsandglass.com', phone: '(210) 555-0177', specialty: 'Windshield & Side', city: 'San Antonio', state: 'TX', status: 'available', rating: 4.7, certifications: ['NGA Certified'], hireDate: '2023-03-20' },
    // Florida
    { id: 9, name: 'Lisa Thompson', email: 'lisa@wheelsandglass.com', phone: '(305) 555-0143', specialty: 'All Glass Types', city: 'Miami', state: 'FL', status: 'offline', rating: 4.8, certifications: ['ADAS Certified', 'OEM Certified'], hireDate: '2022-01-15' },
    { id: 10, name: 'Kevin Brown', email: 'kevin@wheelsandglass.com', phone: '(407) 555-0129', specialty: 'Windshield', city: 'Orlando', state: 'FL', status: 'available', rating: 4.5, certifications: ['NGA Certified'], hireDate: '2023-04-10' },
    { id: 11, name: 'Michelle Davis', email: 'michelle@wheelsandglass.com', phone: '(813) 555-0168', specialty: 'ADAS & Windshield', city: 'Tampa', state: 'FL', status: 'available', rating: 4.9, certifications: ['ADAS Certified'], hireDate: '2022-09-01' },
    // Arizona
    { id: 12, name: 'Robert Martinez', email: 'robert@wheelsandglass.com', phone: '(602) 555-0112', specialty: 'Windshield & Side', city: 'Phoenix', state: 'AZ', status: 'available', rating: 4.7, certifications: ['OEM Certified'], hireDate: '2022-07-15' },
    { id: 13, name: 'Jessica Taylor', email: 'jessica@wheelsandglass.com', phone: '(520) 555-0194', specialty: 'Rear Glass', city: 'Tucson', state: 'AZ', status: 'busy', rating: 4.6, certifications: ['NGA Certified'], hireDate: '2023-01-25' },
    // Nevada
    { id: 14, name: 'Jennifer Lee', email: 'jennifer@wheelsandglass.com', phone: '(702) 555-0176', specialty: 'Fleet Services', city: 'Las Vegas', state: 'NV', status: 'available', rating: 4.9, certifications: ['ADAS Certified', 'Fleet Certified'], hireDate: '2021-08-10' },
    { id: 15, name: 'Daniel Moore', email: 'daniel@wheelsandglass.com', phone: '(775) 555-0145', specialty: 'Windshield', city: 'Reno', state: 'NV', status: 'available', rating: 4.5, certifications: ['NGA Certified'], hireDate: '2023-06-01' },
    // Colorado
    { id: 16, name: 'Christopher White', email: 'chris@wheelsandglass.com', phone: '(303) 555-0187', specialty: 'ADAS Calibration', city: 'Denver', state: 'CO', status: 'available', rating: 4.8, certifications: ['ADAS Certified', 'OEM Certified'], hireDate: '2022-04-20' },
  ];

  seedData.forEach(tech => techniciansStore.set(tech.id, tech));
  console.log(`[TECHNICIANS] Initialized ${seedData.length} technicians`);
}

// Initialize on module load
initializeTechnicians();

/**
 * GET /api/technicians
 * List all technicians with optional filters
 */
router.get('/', async (req: Request, res: Response) => {
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
      technicians: paginatedTechnicians,
      total: technicians.length,
      limit: limitNum,
      offset: offsetNum
    });

  } catch (error) {
    console.error('Error fetching technicians:', error);
    res.status(500).json({
      error: 'Failed to fetch technicians',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/technicians/by-location
 * Get technicians by state and optionally city
 */
router.get('/by-location', async (req: Request, res: Response) => {
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
      technicians,
      total: technicians.length,
      state,
      city: city || 'all'
    });

  } catch (error) {
    console.error('Error fetching technicians by location:', error);
    res.status(500).json({
      error: 'Failed to fetch technicians',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/technicians/stats
 * Get technician statistics by state
 */
router.get('/stats', async (req: Request, res: Response) => {
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
      totalTechnicians: technicians.length,
      totalStates: stats.length,
      totalAvailable: technicians.filter(t => t.status === 'available').length,
      byState: stats
    });

  } catch (error) {
    console.error('Error fetching technician stats:', error);
    res.status(500).json({
      error: 'Failed to fetch statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/technicians/:id
 * Get a single technician by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid technician ID' });
    }

    const technician = techniciansStore.get(id);

    if (!technician) {
      return res.status(404).json({ error: 'Technician not found' });
    }

    res.json(technician);

  } catch (error) {
    console.error('Error fetching technician:', error);
    res.status(500).json({
      error: 'Failed to fetch technician',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PATCH /api/technicians/:id/status
 * Update technician status
 */
router.patch('/:id/status', async (req: Request, res: Response) => {
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
      technician
    });

  } catch (error) {
    console.error('Error updating technician status:', error);
    res.status(500).json({
      error: 'Failed to update technician status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
