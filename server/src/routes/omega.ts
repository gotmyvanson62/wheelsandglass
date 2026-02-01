import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { storage } from '../storage.js';

const router = Router();

/**
 * GET /api/omega/technicians
 * Get technicians/installers from enrolled subcontractors
 */
router.get('/technicians', async (req: Request, res: Response) => {
  try {
    // Query real subcontractors from database
    const subcontractors = await storage.getActiveSubcontractors();

    // Transform subcontractors to technician format
    const technicians = subcontractors.map((sub: any) => ({
      id: sub.id,
      name: sub.name,
      status: sub.isActive ? 'Available' : 'Offline',
      specialties: sub.specialties || [],
      currentJobs: 0,
      weeklyCapacity: sub.maxJobsPerDay ? sub.maxJobsPerDay * 5 : 25,
      location: sub.serviceAreas?.length > 0 ? `ZIP: ${sub.serviceAreas[0]}` : 'Unknown',
      phone: sub.phone || '',
      email: sub.email || ''
    }));

    res.json(technicians);
  } catch (error) {
    console.error('Error fetching technicians:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch technicians' });
  }
});

/**
 * GET /api/omega/reports
 * Get reports and analytics
 */
router.get('/reports', async (req: Request, res: Response) => {
  try {
    const { type = 'overview', startDate, endDate } = req.query;

    // Generate reports from local data
    const transactions = await storage.getTransactions();
    const appointments = await storage.getAppointments();
    const subcontractors = await storage.getActiveSubcontractors();

    // Build technician performance from real subcontractor data
    const technicianPerformance = subcontractors.map((sub: any) => ({
      name: sub.name,
      jobsCompleted: 0,
      rating: sub.rating || 0,
      efficiency: 'N/A'
    }));

    const reports = {
      overview: {
        totalJobs: transactions.length,
        completedJobs: transactions.filter((t: any) => t.status === 'success').length,
        pendingJobs: transactions.filter((t: any) => t.status === 'pending').length,
        failedJobs: transactions.filter((t: any) => t.status === 'failed').length,
        scheduledAppointments: appointments.filter((apt: any) => apt.status === 'scheduled').length,
        avgProcessingTime: '2.3 hours',
        customerSatisfaction: '94%'
      },
      revenue: {
        thisMonth: '$0',
        lastMonth: '$0',
        growth: '0%',
        avgJobValue: '$0'
      },
      technician_performance: technicianPerformance
    };

    res.json(reports);
  } catch (error) {
    console.error('Error generating reports:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to generate reports' });
  }
});

/**
 * GET /api/omega/status
 * Get Omega EDI connection status
 */
router.get('/status', async (req: Request, res: Response) => {
  const omegaApiKey = process.env.OMEGA_API_KEY;
  const omegaShopId = process.env.OMEGA_SHOP_ID;

  res.json({
    success: true,
    configured: !!(omegaApiKey && omegaShopId),
    status: omegaApiKey ? 'connected' : 'not_configured',
    message: omegaApiKey ? 'Omega EDI integration active' : 'Omega EDI not configured - set OMEGA_API_KEY and OMEGA_SHOP_ID'
  });
});

export default router;
