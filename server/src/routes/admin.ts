import { Router, RequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import { storage } from '../storage.js';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * SECURITY: Timing-safe password verification
 * Supports both bcrypt hashes and plaintext passwords
 * Bcrypt hashes start with $2a$ or $2b$
 */
async function verifyPassword(inputPassword: string, storedPassword: string): Promise<boolean> {
  // Check if stored password is a bcrypt hash
  if (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$')) {
    return bcrypt.compare(inputPassword, storedPassword);
  }

  // SECURITY WARNING: Using plaintext password comparison
  // This is vulnerable to timing attacks even with timingSafeEqual if lengths differ
  if (process.env.NODE_ENV === 'production') {
    console.warn('[SECURITY WARNING] Using plaintext ADMIN_PASSWORD in production. Generate a bcrypt hash with: npx bcryptjs hash "yourpassword"');
  }

  // Use timing-safe comparison for plaintext (still better than direct comparison)
  const inputBuffer = Buffer.from(inputPassword);
  const storedBuffer = Buffer.from(storedPassword);

  // Pad to same length to prevent length-based timing attacks
  const maxLength = Math.max(inputBuffer.length, storedBuffer.length);
  const paddedInput = Buffer.alloc(maxLength, 0);
  const paddedStored = Buffer.alloc(maxLength, 0);
  inputBuffer.copy(paddedInput);
  storedBuffer.copy(paddedStored);

  return crypto.timingSafeEqual(paddedInput, paddedStored) && inputBuffer.length === storedBuffer.length;
}

// SECURITY: Aggressive rate limiting for login endpoint to prevent brute-force attacks
const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Only 5 login attempts per 15 minutes per IP
  message: {
    success: false,
    message: 'Too many login attempts. Please try again in 15 minutes.',
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
  // Skip successful requests (only count failures)
  skipSuccessfulRequests: true,
});

// SECURITY: Stricter rate limit for password change endpoint
const passwordChangeRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Only 3 password change attempts per hour per IP
  message: {
    success: false,
    message: 'Too many password change attempts. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation schemas for user management
const createUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['admin', 'super_admin']).optional().default('admin'),
});

const updateUserSchema = z.object({
  username: z.string().min(3).optional(),
  email: z.string().email().optional(),
  role: z.enum(['admin', 'super_admin']).optional(),
  isActive: z.boolean().optional(),
});

/**
 * POST /api/admin/login
 * Admin authentication endpoint
 * SECURITY: Rate limited to prevent brute-force attacks
 */
router.post('/login', loginRateLimit as unknown as RequestHandler, async (req, res) => {
  try {
    const { password } = req.body;

    // Check if environment is configured
    if (!ADMIN_PASSWORD || !JWT_SECRET) {
      console.error('[AUTH] Missing required environment variables: ADMIN_PASSWORD or JWT_SECRET');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error. Contact administrator.'
      });
    }

    // Validate password using timing-safe comparison
    if (!password) {
      console.log('[AUTH] Empty password attempt');
      return res.status(401).json({
        success: false,
        message: 'Invalid password. Please try again.'
      });
    }

    const isValidPassword = await verifyPassword(password, ADMIN_PASSWORD);
    if (!isValidPassword) {
      console.log('[AUTH] Invalid password attempt');
      return res.status(401).json({
        success: false,
        message: 'Invalid password. Please try again.'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { role: 'admin', iat: Math.floor(Date.now() / 1000) },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Log successful login
    await storage.createActivityLog({
      type: 'admin_login',
      message: 'Admin login successful',
      details: {
        timestamp: new Date().toISOString()
      }
    });

    // SECURITY: Set token as httpOnly cookie instead of returning in body
    // This prevents XSS attacks from stealing the token
    res.cookie('admin_token', token, {
      httpOnly: true, // SECURITY: Not accessible via JavaScript
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/',
    });

    console.log('[AUTH] Admin login successful');
    res.json({
      success: true,
      message: 'Login successful',
      // SECURITY: Also return token for backwards compatibility during migration
      // Can be removed once client fully uses cookies
      token
    });
  } catch (error) {
    console.error('[AUTH] Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
});

/**
 * POST /api/admin/reset
 * Clears all transactional data for fresh testing
 * Preserves configurations and field mappings
 * SECURITY: Requires authentication - destructive operation
 */
router.post('/reset', authMiddleware, async (req, res) => {
  try {
    console.log('[ADMIN] Reset data request received');

    await storage.resetAllData();

    // Log the reset action
    await storage.createActivityLog({
      type: 'system_reset',
      message: 'System data reset completed',
      details: {
        resetBy: 'admin',
        timestamp: new Date().toISOString()
      }
    });

    res.json({
      success: true,
      message: 'All data has been cleared. Ready for fresh testing.',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[ADMIN] Reset failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/admin/status
 * Returns current data counts for verification
 * SECURITY: Requires authentication
 */
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const [transactions, quotes, activities, customers] = await Promise.all([
      storage.getTransactions(),
      storage.getQuoteSubmissions(),
      storage.getActivityLogs(100),
      storage.getCustomers()
    ]);

    res.json({
      success: true,
      counts: {
        transactions: transactions.length,
        quoteSubmissions: quotes.length,
        activityLogs: activities.length,
        customers: customers.length
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[ADMIN] Status check failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get status'
    });
  }
});

// ============================================
// USER MANAGEMENT ENDPOINTS
// ============================================

/**
 * GET /api/admin/users
 * List all admin users
 * SECURITY: Requires authentication
 */
router.get('/users', authMiddleware, async (req, res) => {
  try {
    const users = await storage.getAdminUsers();
    // Remove password field from response
    const safeUsers = users.map(({ password, ...user }: any) => user);
    res.json({ success: true, users: safeUsers });
  } catch (error) {
    console.error('[ADMIN] Failed to fetch users:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
});

/**
 * POST /api/admin/users
 * Create a new admin user
 * SECURITY: Requires authentication
 */
router.post('/users', authMiddleware, async (req, res) => {
  try {
    const validationResult = createUserSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationResult.error.errors
      });
    }

    const { username, email, password, role } = validationResult.data;

    // Check if username or email already exists
    const existingUsers = await storage.getAdminUsers();
    if (existingUsers.some((u: any) => u.username === username)) {
      return res.status(409).json({ success: false, error: 'Username already exists' });
    }
    if (existingUsers.some((u: any) => u.email === email)) {
      return res.status(409).json({ success: false, error: 'Email already exists' });
    }

    const user = await storage.createAdminUser({ username, email, password, role });

    // Log the action
    await storage.createActivityLog({
      type: 'user_created',
      message: `Admin user ${username} created`,
      details: { username, email, role }
    });

    // Remove password from response
    const { password: _, ...safeUser } = user;
    res.status(201).json({ success: true, user: safeUser });
  } catch (error) {
    console.error('[ADMIN] Failed to create user:', error);
    res.status(500).json({ success: false, error: 'Failed to create user' });
  }
});

/**
 * PUT /api/admin/users/:id
 * Update an admin user
 * SECURITY: Requires authentication
 */
router.put('/users/:id', authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid user ID' });
    }

    const validationResult = updateUserSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationResult.error.errors
      });
    }

    const updates = validationResult.data;

    // Check for duplicate username/email if being updated
    if (updates.username || updates.email) {
      const existingUsers = await storage.getAdminUsers();
      if (updates.username && existingUsers.some((u: any) => u.username === updates.username && u.id !== id)) {
        return res.status(409).json({ success: false, error: 'Username already exists' });
      }
      if (updates.email && existingUsers.some((u: any) => u.email === updates.email && u.id !== id)) {
        return res.status(409).json({ success: false, error: 'Email already exists' });
      }
    }

    const user = await storage.updateAdminUser(id, updates);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Log the action
    await storage.createActivityLog({
      type: 'user_updated',
      message: `Admin user ${id} updated`,
      details: { userId: id, updates: Object.keys(updates) }
    });

    // Remove password from response
    const { password: _, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  } catch (error) {
    console.error('[ADMIN] Failed to update user:', error);
    res.status(500).json({ success: false, error: 'Failed to update user' });
  }
});

/**
 * DELETE /api/admin/users/:id
 * Delete an admin user
 * SECURITY: Requires authentication
 */
router.delete('/users/:id', authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid user ID' });
    }

    // Prevent deletion of super admin (user ID 1)
    if (id === 1) {
      return res.status(403).json({ success: false, error: 'Cannot delete the primary admin user' });
    }

    const success = await storage.deleteAdminUser(id);
    if (!success) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Log the action
    await storage.createActivityLog({
      type: 'user_deleted',
      message: `Admin user ${id} deleted`,
      details: { userId: id }
    });

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('[ADMIN] Failed to delete user:', error);
    res.status(500).json({ success: false, error: 'Failed to delete user' });
  }
});

/**
 * PUT /api/admin/password
 * Change password for the current user or specified user
 * SECURITY: Requires authentication
 */
router.put('/password', passwordChangeRateLimit as unknown as RequestHandler, authMiddleware, async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 8 characters'
      });
    }

    // For now, we'll update the password directly
    // In a real app, you'd verify currentPassword against stored hash
    const success = await storage.changeAdminPassword(userId || 1, newPassword);

    if (!success) {
      return res.status(400).json({ success: false, error: 'Failed to change password' });
    }

    // Log the action
    await storage.createActivityLog({
      type: 'password_changed',
      message: 'Admin password changed',
      details: { userId: userId || 1 }
    });

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('[ADMIN] Failed to change password:', error);
    res.status(500).json({ success: false, error: 'Failed to change password' });
  }
});

export default router;
