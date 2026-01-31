import { Router, Request, Response } from 'express';
import { storage } from '../storage.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// SECURITY: All dashboard routes require authentication
router.use(authMiddleware);

// GET /api/dashboard/stats - Get dashboard statistics
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const transactionStats = await storage.getTransactionStats();
    const appointments = await storage.getAppointments();
    const activityLogs = await storage.getActivityLogs(10);

    // Get all transactions for revenue calculation
    const allTransactions = await storage.getTransactions();
    const successfulTransactions = allTransactions.filter(t => t.status === 'success');

    // Calculate today's metrics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTransactions = successfulTransactions.filter(t =>
      new Date(t.createdAt) >= today
    );

    // Calculate revenue (default $275 RPJ if no amount specified)
    const RPJ_DEFAULT = 27500; // $275.00 in cents
    const invoicesPaid = successfulTransactions.filter(t => t.paymentStatus === 'paid').length;
    const totalRevenue = successfulTransactions.reduce((sum, t) =>
      sum + (t.amount || RPJ_DEFAULT), 0
    );
    const completedToday = todayTransactions.length;
    const revenueToday = todayTransactions.reduce((sum, t) =>
      sum + (t.amount || RPJ_DEFAULT), 0
    );

    const stats = {
      formSubmissions: transactionStats.total,
      jobsScheduled: appointments.filter(a => a.status === 'scheduled' || a.status === 'confirmed').length,
      jobsCompleted: transactionStats.success,
      invoicesPaid,
      totalRevenue,
      pendingJobs: transactionStats.pending,
      activeJobs: appointments.filter(a => a.status === 'in_progress').length,
      completedToday,
      revenueToday,
    };

    res.json({
      success: true,
      data: {
        stats,
        recentActivity: activityLogs.map(log => ({
          id: log.id,
          type: log.type,
          message: log.message,
          timestamp: log.timestamp,
        })),
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// GET /api/dashboard/recent-activity - Get recent activity
router.get('/recent-activity', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const activityLogs = await storage.getActivityLogs(limit);
    res.json({ success: true, data: activityLogs });
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

// GET /api/dashboard/revenue - Get revenue statistics
router.get('/revenue', async (_req: Request, res: Response) => {
  try {
    const revenue = {
      contracted: 0,
      collected: 0,
      outstanding: 0,
    };

    res.json({ success: true, data: revenue });
  } catch (error) {
    console.error('Error fetching revenue:', error);
    res.status(500).json({ error: 'Failed to fetch revenue' });
  }
});

// GET /api/dashboard/activity - Alias for recent-activity
router.get('/activity', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const activityLogs = await storage.getActivityLogs(limit);
    res.json({ success: true, data: activityLogs });
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

// GET /api/dashboard/transactions - Get recent transactions
router.get('/transactions', async (req: Request, res: Response) => {
  try {
    const { status, limit = '25', offset = '0' } = req.query;

    const transactions = await storage.getTransactions({
      status: status as string | undefined,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });

    res.json({ success: true, data: transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch transactions' });
  }
});

// GET /api/dashboard/summary - Get overall summary
router.get('/summary', async (_req: Request, res: Response) => {
  try {
    const stats = await storage.getTransactionStats();
    const appointments = await storage.getAppointments();

    const pendingAppointments = appointments.filter(a =>
      a.status === 'requested' || a.status === 'scheduled'
    ).length;

    res.json({
      success: true,
      data: {
        totalTransactions: stats.total,
        successfulTransactions: stats.success,
        failedTransactions: stats.failed,
        pendingTransactions: stats.pending,
        pendingAppointments,
        successRate: stats.total > 0
          ? Math.round((stats.success / stats.total) * 100)
          : 0,
      }
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch summary' });
  }
});

export default router;
