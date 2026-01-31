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
const techniciansStore: Map<number, Technician> = new Map();

// Initialize with seed technicians for demo/testing
function initializeTechnicians() {
  const seedData: Technician[] = [
    // California
    { id: 1, name: 'Mike Rodriguez', email: 'mike@wheelsandglass.com', phone: '(213) 555-0142', specialty: 'ADAS & Windshield', city: 'Los Angeles', state: 'CA', status: 'available', rating: 4.9, certifications: ['ADAS Certified', 'OEM Certified'], hireDate: '2022-03-15', zipCodes: ['90001', '90002', '90003', '90004', '90005', '90006', '90007', '90008', '90010', '90011', '90012', '90013', '90014', '90015', '90016', '90017', '90018', '90019', '90020', '90021'] },
    { id: 2, name: 'Sarah Kim', email: 'sarah@wheelsandglass.com', phone: '(415) 555-0198', specialty: 'Side Glass', city: 'San Francisco', state: 'CA', status: 'available', rating: 4.8, certifications: ['NGA Certified'], hireDate: '2023-01-10', zipCodes: ['94102', '94103', '94104', '94105', '94107', '94108', '94109', '94110', '94111', '94112', '94114', '94115', '94116', '94117', '94118', '94121', '94122', '94123', '94124', '94127'] },
    { id: 3, name: 'David Chen', email: 'david@wheelsandglass.com', phone: '(619) 555-0127', specialty: 'Sunroof & Rear Glass', city: 'San Diego', state: 'CA', status: 'busy', rating: 4.7, certifications: ['OEM Certified'], hireDate: '2022-08-22', zipCodes: ['92101', '92102', '92103', '92104', '92105', '92106', '92107', '92108', '92109', '92110', '92111', '92113', '92114', '92115', '92116', '92117', '92118', '92119', '92120', '92121'] },
    { id: 4, name: 'Emily Watson', email: 'emily@wheelsandglass.com', phone: '(916) 555-0156', specialty: 'Windshield', city: 'Sacramento', state: 'CA', status: 'available', rating: 4.6, certifications: ['NGA Certified'], hireDate: '2023-05-01', zipCodes: ['95811', '95814', '95815', '95816', '95817', '95818', '95819', '95820', '95822', '95823', '95824', '95826', '95827', '95828', '95829', '95830', '95831', '95832', '95833', '95834'] },
    // Texas
    { id: 5, name: 'Maria Garcia', email: 'maria@wheelsandglass.com', phone: '(713) 555-0165', specialty: 'Windshield', city: 'Houston', state: 'TX', status: 'available', rating: 4.9, certifications: ['ADAS Certified', 'NGA Certified'], hireDate: '2021-11-30', zipCodes: ['77001', '77002', '77003', '77004', '77005', '77006', '77007', '77008', '77009', '77010', '77011', '77012', '77013', '77014', '77015', '77016', '77017', '77018', '77019', '77020'] },
    { id: 6, name: 'James Wilson', email: 'james@wheelsandglass.com', phone: '(214) 555-0188', specialty: 'ADAS Calibration', city: 'Dallas', state: 'TX', status: 'available', rating: 4.6, certifications: ['ADAS Certified'], hireDate: '2023-02-14', zipCodes: ['75201', '75202', '75203', '75204', '75205', '75206', '75207', '75208', '75209', '75210', '75211', '75212', '75214', '75215', '75216', '75217', '75218', '75219', '75220', '75223'] },
    { id: 7, name: 'Carlos Hernandez', email: 'carlos@wheelsandglass.com', phone: '(512) 555-0133', specialty: 'All Glass Types', city: 'Austin', state: 'TX', status: 'busy', rating: 4.8, certifications: ['OEM Certified', 'NGA Certified'], hireDate: '2022-06-01', zipCodes: ['78701', '78702', '78703', '78704', '78705', '78712', '78717', '78719', '78721', '78722', '78723', '78724', '78725', '78726', '78727', '78728', '78729', '78730', '78731', '78732'] },
    { id: 8, name: 'Amanda Johnson', email: 'amanda@wheelsandglass.com', phone: '(210) 555-0177', specialty: 'Windshield & Side', city: 'San Antonio', state: 'TX', status: 'available', rating: 4.7, certifications: ['NGA Certified'], hireDate: '2023-03-20', zipCodes: ['78201', '78202', '78203', '78204', '78205', '78206', '78207', '78208', '78209', '78210', '78211', '78212', '78213', '78214', '78215', '78216', '78217', '78218', '78219', '78220'] },
    // Florida
    { id: 9, name: 'Lisa Thompson', email: 'lisa@wheelsandglass.com', phone: '(305) 555-0143', specialty: 'All Glass Types', city: 'Miami', state: 'FL', status: 'offline', rating: 4.8, certifications: ['ADAS Certified', 'OEM Certified'], hireDate: '2022-01-15', zipCodes: ['33101', '33109', '33125', '33126', '33127', '33128', '33129', '33130', '33131', '33132', '33133', '33134', '33135', '33136', '33137', '33138', '33139', '33140', '33141', '33142'] },
    { id: 10, name: 'Kevin Brown', email: 'kevin@wheelsandglass.com', phone: '(407) 555-0129', specialty: 'Windshield', city: 'Orlando', state: 'FL', status: 'available', rating: 4.5, certifications: ['NGA Certified'], hireDate: '2023-04-10', zipCodes: ['32801', '32803', '32804', '32805', '32806', '32807', '32808', '32809', '32810', '32811', '32812', '32814', '32817', '32818', '32819', '32820', '32821', '32822', '32824', '32825'] },
    { id: 11, name: 'Michelle Davis', email: 'michelle@wheelsandglass.com', phone: '(813) 555-0168', specialty: 'ADAS & Windshield', city: 'Tampa', state: 'FL', status: 'available', rating: 4.9, certifications: ['ADAS Certified'], hireDate: '2022-09-01', zipCodes: ['33601', '33602', '33603', '33604', '33605', '33606', '33607', '33609', '33610', '33611', '33612', '33613', '33614', '33615', '33616', '33617', '33618', '33619', '33620', '33621'] },
    // Arizona
    { id: 12, name: 'Robert Martinez', email: 'robert@wheelsandglass.com', phone: '(602) 555-0112', specialty: 'Windshield & Side', city: 'Phoenix', state: 'AZ', status: 'available', rating: 4.7, certifications: ['OEM Certified'], hireDate: '2022-07-15', zipCodes: ['85001', '85002', '85003', '85004', '85005', '85006', '85007', '85008', '85009', '85012', '85013', '85014', '85015', '85016', '85017', '85018', '85019', '85020', '85021', '85022'] },
    { id: 13, name: 'Jessica Taylor', email: 'jessica@wheelsandglass.com', phone: '(520) 555-0194', specialty: 'Rear Glass', city: 'Tucson', state: 'AZ', status: 'busy', rating: 4.6, certifications: ['NGA Certified'], hireDate: '2023-01-25', zipCodes: ['85701', '85702', '85704', '85705', '85706', '85708', '85710', '85711', '85712', '85713', '85714', '85715', '85716', '85718', '85719', '85721', '85723', '85724', '85726', '85730'] },
    // Nevada
    { id: 14, name: 'Jennifer Lee', email: 'jennifer@wheelsandglass.com', phone: '(702) 555-0176', specialty: 'Fleet Services', city: 'Las Vegas', state: 'NV', status: 'available', rating: 4.9, certifications: ['ADAS Certified', 'Fleet Certified'], hireDate: '2021-08-10', zipCodes: ['89101', '89102', '89103', '89104', '89106', '89107', '89108', '89109', '89110', '89113', '89115', '89117', '89119', '89120', '89121', '89122', '89123', '89124', '89128', '89129'] },
    { id: 15, name: 'Daniel Moore', email: 'daniel@wheelsandglass.com', phone: '(775) 555-0145', specialty: 'Windshield', city: 'Reno', state: 'NV', status: 'available', rating: 4.5, certifications: ['NGA Certified'], hireDate: '2023-06-01', zipCodes: ['89501', '89502', '89503', '89506', '89509', '89510', '89511', '89512', '89519', '89521', '89523'] },
    // Colorado
    { id: 16, name: 'Christopher White', email: 'chris@wheelsandglass.com', phone: '(303) 555-0187', specialty: 'ADAS Calibration', city: 'Denver', state: 'CO', status: 'available', rating: 4.8, certifications: ['ADAS Certified', 'OEM Certified'], hireDate: '2022-04-20', zipCodes: ['80202', '80203', '80204', '80205', '80206', '80207', '80209', '80210', '80211', '80212', '80214', '80216', '80218', '80219', '80220', '80221', '80222', '80223', '80224', '80227'] },
  ];

  seedData.forEach(tech => techniciansStore.set(tech.id, tech));
  console.log(`[TECHNICIANS] Initialized ${seedData.length} technicians`);
}

// Initialize on module load
initializeTechnicians();

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
 * GET /api/technicians/by-location
 * Get technicians by state and optionally city (protected)
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
 * Uses ZIP code prefix mapping and direct ZIP code matches
 * Returns technicians sorted by availability and rating
 * SECURITY: Requires authentication
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
 * GET /api/technicians/stats
 * Get technician statistics by state (protected)
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
 * GET /api/technicians/:id
 * Get a single technician by ID (protected)
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

export default router;
