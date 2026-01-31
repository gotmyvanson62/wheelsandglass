import { Router, Request, Response } from 'express';
import { storage } from '../storage.js';

const router = Router();

// GET /api/jobs - List all jobs
router.get('/', async (req: Request, res: Response) => {
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

// GET /api/jobs/:id - Get single job
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const jobId = req.params.id;
    const jobRecord = await storage.getJobRecord(jobId);

    if (!jobRecord) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(jobRecord);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

// GET /api/jobs/stats - Get job statistics
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const stats = await storage.getTransactionStats();
    res.json({
      total: stats.total,
      completed: stats.success,
      pending: stats.pending,
      failed: stats.failed,
    });
  } catch (error) {
    console.error('Error fetching job stats:', error);
    res.status(500).json({ error: 'Failed to fetch job statistics' });
  }
});

export default router;
