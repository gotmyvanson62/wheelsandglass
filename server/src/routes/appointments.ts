import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../storage.js';

const router = Router();

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

// GET /api/appointments - List all appointments
router.get('/', async (_req: Request, res: Response) => {
  try {
    const appointments = await storage.getAppointments();
    res.json({ success: true, data: appointments });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// GET /api/appointments/:id - Get single appointment
router.get('/:id', async (req: Request, res: Response) => {
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

// POST /api/appointments - Create appointment
router.post('/', async (req: Request, res: Response) => {
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
    });

    await storage.createActivityLog({
      type: 'appointment_created',
      message: `Appointment created for ${appointmentData.customerName}`,
      details: { appointmentId: appointment.id },
    });

    res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

// PUT /api/appointments/:id - Update appointment
router.put('/:id', async (req: Request, res: Response) => {
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

// DELETE /api/appointments/:id - Delete appointment
router.delete('/:id', async (req: Request, res: Response) => {
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
