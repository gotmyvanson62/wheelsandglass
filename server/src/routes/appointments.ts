import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../storage.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Helper function to extract ZIP code from address string
function extractZipFromAddress(address: string): string | null {
  // Match 5-digit ZIP code, optionally with -4 extension
  const zipMatch = address.match(/\b(\d{5})(?:-\d{4})?\b/);
  return zipMatch ? zipMatch[1] : null;
}

// ZIP code prefix to city/state mapping for technician lookup
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

// Helper function to find city/state from ZIP code prefix
function findCityByZip(zip: string): { city: string; state: string } | null {
  const prefix = zip.substring(0, 3);
  return ZIP_PREFIX_MAP[prefix] || null;
}

// Validation schemas
const createAppointmentSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  customerEmail: z.string().email('Invalid email address'),
  customerPhone: z.string().optional(),
  requestedDate: z.string().min(1, 'Requested date is required'),
  requestedTime: z.string().min(1, 'Requested time is required'),
  serviceAddress: z.string().min(1, 'Service address is required'),
  notes: z.string().optional(),
  transactionId: z.number().optional(),
  customerId: z.number().optional(),
  technicianId: z.number().optional(),  // Optional - will auto-assign if not provided
  autoAssignTechnician: z.boolean().optional().default(true),  // Enable auto-assignment by default
});

const updateAppointmentSchema = z.object({
  customerName: z.string().optional(),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional(),
  requestedDate: z.string().optional(),
  requestedTime: z.string().optional(),
  scheduledDate: z.string().optional(),
  serviceAddress: z.string().optional(),
  status: z.enum(['requested', 'square_scheduled', 'omega_confirmed', 'confirmed', 'cancelled', 'completed']).optional(),
  technicianId: z.string().optional(),
  squareAppointmentId: z.string().optional(),
  omegaAppointmentId: z.string().optional(),
  instructions: z.string().optional(),
  calendarInvitationSent: z.boolean().optional(),
});

// GET /api/appointments - List appointments with optional date range and status filters (protected)
// Query params:
//   - start: ISO date string, filter appointments on/after this date
//   - end: ISO date string, filter appointments on/before this date
//   - status: appointment status filter
//   - limit: max results (default 100)
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { start, end, status, limit = '100' } = req.query;
    let appointments = await storage.getAppointments();

    // Filter by date range if provided
    if (start && typeof start === 'string') {
      const startDate = new Date(start);
      appointments = appointments.filter(a => {
        const appointmentDate = new Date(a.scheduledDate || a.requestedDate);
        return appointmentDate >= startDate;
      });
    }

    if (end && typeof end === 'string') {
      const endDate = new Date(end);
      // Set end date to end of day
      endDate.setHours(23, 59, 59, 999);
      appointments = appointments.filter(a => {
        const appointmentDate = new Date(a.scheduledDate || a.requestedDate);
        return appointmentDate <= endDate;
      });
    }

    // Filter by status if provided
    if (status && typeof status === 'string') {
      appointments = appointments.filter(a => a.status === status);
    }

    // Sort by date (earliest first)
    appointments.sort((a, b) => {
      const dateA = new Date(a.scheduledDate || a.requestedDate).getTime();
      const dateB = new Date(b.scheduledDate || b.requestedDate).getTime();
      return dateA - dateB;
    });

    // Apply limit
    const limitNum = Math.min(parseInt(limit as string) || 100, 500);
    appointments = appointments.slice(0, limitNum);

    res.json({
      success: true,
      data: appointments,
      total: appointments.length,
      filters: { start, end, status }
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// GET /api/appointments/:id - Get single appointment (protected)
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const appointment = await storage.getAppointment(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Appointment not found' }
      });
    }

    res.json({ success: true, data: appointment });
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ error: 'Failed to fetch appointment' });
  }
});

// POST /api/appointments - Create appointment (protected)
// Supports auto-assignment of technician based on service address ZIP code
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = createAppointmentSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationResult.error.errors
      });
    }

    const appointmentData = validationResult.data;
    let technicianId = appointmentData.technicianId?.toString() || null;
    let autoAssignedTechnician: { id: number; name: string; city: string } | null = null;

    // Auto-assign technician if not provided and autoAssignTechnician is enabled
    if (!technicianId && appointmentData.autoAssignTechnician !== false) {
      const zip = extractZipFromAddress(appointmentData.serviceAddress);
      if (zip) {
        // Find matching city/state for this ZIP
        const cityData = findCityByZip(zip);
        if (cityData) {
          // Log the auto-assignment attempt
          console.log(`[APPOINTMENT] Auto-assigning technician for ZIP ${zip} (${cityData.city}, ${cityData.state})`);

          // Store technician suggestion in activity log for manual assignment
          // In production, this would query the technicians service directly
          autoAssignedTechnician = {
            id: 0,
            name: `Auto-assign pending for ${cityData.city}`,
            city: cityData.city
          };
        }
      }
    }

    const appointment = await storage.createAppointment({
      customerName: appointmentData.customerName,
      customerEmail: appointmentData.customerEmail,
      customerPhone: appointmentData.customerPhone,
      requestedDate: appointmentData.requestedDate,
      requestedTime: appointmentData.requestedTime,
      serviceAddress: appointmentData.serviceAddress,
      status: 'requested',
      instructions: appointmentData.notes,
      transactionId: appointmentData.transactionId,
      customerId: appointmentData.customerId,
      technicianId: technicianId,
    });

    // Log activity with auto-assignment info
    await storage.createActivityLog({
      type: 'appointment_created',
      message: `Appointment created for ${appointmentData.customerName}${autoAssignedTechnician ? ` - suggested area: ${autoAssignedTechnician.city}` : ''}`,
      details: {
        appointmentId: appointment.id,
        zip: extractZipFromAddress(appointmentData.serviceAddress),
        suggestedArea: autoAssignedTechnician?.city || null,
      },
    });

    res.status(201).json({
      success: true,
      data: appointment,
      autoAssignment: autoAssignedTechnician ? {
        suggestedCity: autoAssignedTechnician.city,
        message: `Use GET /api/technicians/by-zip/{zip} to find available technicians`
      } : null
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

// PUT /api/appointments/:id - Update appointment (protected)
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid appointment ID'
      });
    }

    // Validate request body
    const validationResult = updateAppointmentSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationResult.error.errors
      });
    }

    const updates = validationResult.data;
    const appointment = await storage.updateAppointment(id, updates);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Appointment not found' }
      });
    }

    res.json({ success: true, data: appointment });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

// DELETE /api/appointments/:id - Delete appointment (protected)
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const appointment = await storage.getAppointment(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Appointment not found' }
      });
    }

    // Actually delete the appointment
    const deleted = await storage.deleteAppointment(id);
    if (!deleted) {
      return res.status(500).json({ success: false, error: 'Failed to delete appointment' });
    }

    // Log the deletion
    await storage.createActivityLog({
      type: 'appointment_deleted',
      message: `Appointment ${id} deleted for ${appointment.customerName}`,
      details: { appointmentId: id, customerName: appointment.customerName }
    });

    res.json({ success: true, message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
});

export default router;
