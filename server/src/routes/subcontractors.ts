import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { storage } from '../storage.js';

const router = Router();

/**
 * GET /api/subcontractors
 * List all subcontractors (protected)
 */
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const subcontractors = await storage.getActiveSubcontractors();
    res.json({ success: true, data: subcontractors });
  } catch (error) {
    console.error('Error fetching subcontractors:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch subcontractors' });
  }
});

/**
 * GET /api/subcontractors/all
 * List all subcontractors including inactive (protected)
 */
router.get('/all', authMiddleware, async (req: Request, res: Response) => {
  try {
    // Get all subcontractors regardless of status
    const activeSubcontractors = await storage.getActiveSubcontractors();
    // Note: getActiveSubcontractors might filter by status, so we return what we get
    res.json({ success: true, data: activeSubcontractors });
  } catch (error) {
    console.error('Error fetching all subcontractors:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch subcontractors' });
  }
});

/**
 * GET /api/subcontractors/:id
 * Get a single subcontractor by ID (protected)
 */
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid subcontractor ID' });
    }

    const subcontractor = await storage.getSubcontractor(id);
    if (!subcontractor) {
      return res.status(404).json({ success: false, error: 'Subcontractor not found' });
    }

    res.json({ success: true, data: subcontractor });
  } catch (error) {
    console.error('Error fetching subcontractor:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch subcontractor' });
  }
});

/**
 * POST /api/subcontractors
 * Create/enroll a new subcontractor (protected)
 */
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { name, email, phone, serviceAreas, specialties } = req.body;

    // Validate required fields
    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and phone are required'
      });
    }

    // Create subcontractor with isActive=false (requires admin approval)
    const subcontractorData = {
      name,
      email,
      phone,
      serviceAreas: serviceAreas || [],
      specialties: specialties || [],
      rating: 0,
      isActive: false,  // Pending approval
      maxJobsPerDay: 8,
      preferredContactMethod: 'email',
    };

    const subcontractor = await storage.createSubcontractor(subcontractorData);

    // Log the enrollment
    await storage.createActivityLog({
      type: 'subcontractor_enrolled',
      message: `New subcontractor enrolled: ${name}`,
      details: { subcontractorId: subcontractor.id, email, phone }
    });

    res.status(201).json({ success: true, data: subcontractor });
  } catch (error) {
    console.error('Error creating subcontractor:', error);
    res.status(500).json({ success: false, error: 'Failed to create subcontractor' });
  }
});

/**
 * PUT /api/subcontractors/:id
 * Update a subcontractor (protected)
 */
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid subcontractor ID' });
    }

    const existing = await storage.getSubcontractor(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Subcontractor not found' });
    }

    const updates = req.body;
    await storage.updateSubcontractor(id, updates);

    const updated = await storage.getSubcontractor(id);

    // Log the update
    await storage.createActivityLog({
      type: 'subcontractor_updated',
      message: `Subcontractor ${id} updated`,
      details: { subcontractorId: id, updates: Object.keys(updates) }
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating subcontractor:', error);
    res.status(500).json({ success: false, error: 'Failed to update subcontractor' });
  }
});

/**
 * PUT /api/subcontractors/:id/approve
 * Approve a pending subcontractor (admin only)
 */
router.put('/:id/approve', authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid subcontractor ID' });
    }

    const existing = await storage.getSubcontractor(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Subcontractor not found' });
    }

    // Update isActive to true
    await storage.updateSubcontractor(id, { isActive: true });

    // Log the approval
    await storage.createActivityLog({
      type: 'subcontractor_approved',
      message: `Subcontractor ${existing.name} approved for service`,
      details: { subcontractorId: id }
    });

    res.json({ success: true, message: 'Subcontractor approved successfully' });
  } catch (error) {
    console.error('Error approving subcontractor:', error);
    res.status(500).json({ success: false, error: 'Failed to approve subcontractor' });
  }
});

/**
 * PUT /api/subcontractors/:id/reject
 * Reject a pending subcontractor (admin only)
 */
router.put('/:id/reject', authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid subcontractor ID' });
    }

    const existing = await storage.getSubcontractor(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Subcontractor not found' });
    }

    const { reason } = req.body;

    // Update isActive to false (rejected)
    await storage.updateSubcontractor(id, { isActive: false });

    // Log the rejection
    await storage.createActivityLog({
      type: 'subcontractor_rejected',
      message: `Subcontractor ${existing.name} rejected`,
      details: { subcontractorId: id, reason: reason || 'No reason provided' }
    });

    res.json({ success: true, message: 'Subcontractor rejected' });
  } catch (error) {
    console.error('Error rejecting subcontractor:', error);
    res.status(500).json({ success: false, error: 'Failed to reject subcontractor' });
  }
});

/**
 * DELETE /api/subcontractors/:id
 * Soft-delete (deactivate) a subcontractor (admin only)
 */
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid subcontractor ID' });
    }

    const existing = await storage.getSubcontractor(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Subcontractor not found' });
    }

    // Soft delete by setting isActive to false
    await storage.updateSubcontractor(id, { isActive: false });

    // Log the deactivation
    await storage.createActivityLog({
      type: 'subcontractor_deactivated',
      message: `Subcontractor ${existing.name} deactivated`,
      details: { subcontractorId: id }
    });

    res.json({ success: true, message: 'Subcontractor deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating subcontractor:', error);
    res.status(500).json({ success: false, error: 'Failed to deactivate subcontractor' });
  }
});

/**
 * GET /api/subcontractors/:id/availability
 * Get availability for a subcontractor (protected)
 */
router.get('/:id/availability', authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid subcontractor ID' });
    }

    const { date } = req.query;
    const targetDate = date ? new Date(date as string) : new Date();

    const availability = await storage.getSubcontractorAvailability(id, targetDate);

    res.json({ success: true, data: availability });
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch availability' });
  }
});

/**
 * POST /api/subcontractors/:id/availability
 * Set availability for a subcontractor (protected)
 */
router.post('/:id/availability', authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid subcontractor ID' });
    }

    const { date, timeSlots, maxJobs, isAvailable, notes } = req.body;

    if (!date) {
      return res.status(400).json({ success: false, error: 'Date is required' });
    }

    const availabilityData = {
      subcontractorId: id,
      date: new Date(date),
      timeSlots: timeSlots || ['09:00', '13:00', '15:00'],
      maxJobs: maxJobs || 8,
      currentJobs: 0,
      isAvailable: isAvailable !== false,
      notes: notes || null
    };

    const availability = await storage.createSubcontractorAvailability(availabilityData);

    res.status(201).json({ success: true, data: availability });
  } catch (error) {
    console.error('Error creating availability:', error);
    res.status(500).json({ success: false, error: 'Failed to create availability' });
  }
});

export default router;
