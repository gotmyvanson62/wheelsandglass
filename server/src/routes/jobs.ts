import { Router, Request, Response } from 'express';
import { storage } from '../storage.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// GET /api/jobs - List all jobs (protected)
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const transactions = await storage.getTransactions({ limit: 50 });

    // Transform transactions to job-like format
    const jobs = transactions.map(t => ({
      id: t.id,
      jobNumber: `JOB-${t.id.toString().padStart(5, '0')}`,
      status: t.status,
      customerName: t.customerName,
      customerEmail: t.customerEmail,
      customerPhone: t.customerPhone,
      vehicleYear: t.vehicleYear,
      vehicleMake: t.vehicleMake,
      vehicleModel: t.vehicleModel,
      vehicleVin: t.vehicleVin,
      createdAt: t.timestamp,
    }));

    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// GET /api/jobs/stats - Get job statistics (protected)
// NOTE: This route MUST come before /:id to avoid route conflict
router.get('/stats', authMiddleware, async (_req: Request, res: Response) => {
  try {
    const stats = await storage.getTransactionStats();
    res.json({
      success: true,
      data: {
        total: stats.total,
        completed: stats.success,
        pending: stats.pending,
        failed: stats.failed,
      }
    });
  } catch (error) {
    console.error('Error fetching job stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch job statistics' });
  }
});

// GET /api/jobs/:id - Get single job (protected)
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const jobId = req.params.id;
    const jobRecord = await storage.getJobRecord(jobId);

    if (!jobRecord) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    res.json({ success: true, data: jobRecord });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch job' });
  }
});

export default router;
