import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import { errorMiddleware, notFoundMiddleware } from './middleware/error.middleware.js';
import { loggingMiddleware } from './middleware/logging.middleware.js';
import { validateEnv, logEnvStatus, features } from './config/env.js';
import { logger } from './utils/logger.js';

dotenv.config({ path: '../.env' });

// Validate environment variables at startup
const env = validateEnv();
logEnvStatus();

export function createApp(): Express {
  const app = express();

  // Security middleware
  app.use(helmet());

  // CORS configuration - SECURITY: Require explicit origin in production
  const corsOrigin = process.env.CLIENT_URL;
  if (!corsOrigin && process.env.NODE_ENV === 'production') {
    logger.warn('[SECURITY] CLIENT_URL not configured - CORS will reject cross-origin requests');
  }
  app.use(cors({
    origin: corsOrigin || (process.env.NODE_ENV === 'production' ? false : 'http://localhost:5173'),
    credentials: true,
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api', limiter);

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Logging
  if (process.env.NODE_ENV !== 'production') {
    app.use(loggingMiddleware);
  }

  // Health check with service status
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      env: env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: features.isDatabaseConfigured(),
        square: features.isSquareConfigured(),
        sms: features.isQuoConfigured(),
        omega: features.isOmegaConfigured(),
      },
    });
  });

  // Test route
  app.get('/api/test', (req, res) => {
    res.json({
      success: true,
      message: 'API is working',
      timestamp: new Date().toISOString(),
    });
  });

  // API Routes
  app.use('/api', routes);

  // 404 handler
  app.use(notFoundMiddleware);

  // Error handling
  app.use(errorMiddleware);

  return app;
}
