import { z } from 'zod';

// Helper for optional URL fields that might be empty strings
const optionalUrl = z.string().url().optional().or(z.literal('').transform(() => undefined));

/**
 * Environment variable validation schema
 * Validates all required environment variables at startup
 */
const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('5000'),

  // Database - at least one is required
  DATABASE_URL: z.string().optional(),
  POSTGRES_URL: z.string().optional(),

  // Authentication
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters').optional(),
  SESSION_SECRET: z.string().min(16).optional(),
  ADMIN_PASSWORD: z.string().min(8).optional(),

  // Client URL for CORS
  CLIENT_URL: z.string().url().optional().default('http://localhost:5173'),

  // Square API (optional - for payments)
  SQUARE_ACCESS_TOKEN: z.string().optional(),
  SQUARE_ENVIRONMENT: z.enum(['sandbox', 'production']).optional().default('sandbox'),
  SQUARE_LOCATION_ID: z.string().optional(),
  SQUARE_WEBHOOK_SECRET: z.string().optional(),

  // Quo/OpenPhone SMS (optional - for SMS)
  QUO_API_KEY: z.string().optional(),
  QUO_PHONE_NUMBER_ID: z.string().optional(),
  QUO_WEBHOOK_SECRET: z.string().optional(),
  QUO_BASE_URL: z.string().url().optional().default('https://api.openphone.com/v1'),

  // Omega EDI (optional - for glass ordering)
  OMEGA_API_KEY: z.string().optional(),
  OMEGA_API_BASE_URL: optionalUrl,
  OMEGA_SHOP_ID: z.string().optional(),

  // VIN Lookup (optional)
  VIN_API_KEY: z.string().optional(),
  VIN_API_URL: optionalUrl,

  // NAGS Lookup (optional)
  NAGS_API_KEY: z.string().optional(),
  NAGS_API_URL: optionalUrl,
}).refine(
  (data) => data.DATABASE_URL || data.POSTGRES_URL,
  { message: 'Either DATABASE_URL or POSTGRES_URL must be set' }
).refine(
  (data) => data.NODE_ENV !== 'production' || (data.JWT_SECRET && data.JWT_SECRET.length >= 32),
  { message: 'JWT_SECRET is required in production and must be at least 32 characters' }
);

export type Env = z.infer<typeof envSchema>;

/**
 * Validated environment configuration
 */
let _env: Env | null = null;

/**
 * Validate and load environment variables
 * Throws if validation fails
 */
export function validateEnv(): Env {
  if (_env) return _env;

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('\n==========================================');
    console.error('ENVIRONMENT CONFIGURATION ERROR');
    console.error('==========================================\n');

    result.error.issues.forEach((issue) => {
      console.error(`- ${issue.path.join('.')}: ${issue.message}`);
    });

    console.error('\n==========================================');
    console.error('Check your .env file and environment variables');
    console.error('==========================================\n');

    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }

    // In development, use defaults for missing/invalid values
    _env = {
      NODE_ENV: 'development',
      PORT: 3001,
      DATABASE_URL: process.env.DATABASE_URL,
      POSTGRES_URL: process.env.POSTGRES_URL,
      CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
      SQUARE_ENVIRONMENT: 'sandbox',
      QUO_BASE_URL: 'https://api.openphone.com/v1',
    } as Env;
    return _env;
  }

  _env = result.data as Env;
  return _env;
}

/**
 * Get the validated environment
 * Call validateEnv() first
 */
export function getEnv(): Env {
  if (!_env) {
    return validateEnv();
  }
  return _env;
}

/**
 * Check if a feature is configured
 */
export const features = {
  isSquareConfigured(): boolean {
    const env = getEnv();
    return !!(env.SQUARE_ACCESS_TOKEN && env.SQUARE_LOCATION_ID);
  },

  isQuoConfigured(): boolean {
    const env = getEnv();
    return !!(env.QUO_API_KEY && env.QUO_PHONE_NUMBER_ID);
  },

  isOmegaConfigured(): boolean {
    const env = getEnv();
    return !!(env.OMEGA_API_KEY && env.OMEGA_API_BASE_URL);
  },

  isDatabaseConfigured(): boolean {
    const env = getEnv();
    return !!(env.DATABASE_URL || env.POSTGRES_URL);
  }
};

/**
 * Log environment status (development only)
 */
export function logEnvStatus(): void {
  const env = getEnv();

  if (env.NODE_ENV === 'production') return;

  console.log('\n--- Environment Configuration ---');
  console.log(`Environment: ${env.NODE_ENV}`);
  console.log(`Port: ${env.PORT}`);
  console.log(`Database: ${env.DATABASE_URL ? 'Configured' : (env.POSTGRES_URL ? 'Configured (Vercel)' : 'NOT CONFIGURED')}`);
  console.log(`JWT: ${env.JWT_SECRET ? 'Configured' : 'Using fallback (dev only)'}`);
  console.log(`Square: ${features.isSquareConfigured() ? 'Configured' : 'Not configured'}`);
  console.log(`Quo SMS: ${features.isQuoConfigured() ? 'Configured' : 'Not configured'}`);
  console.log(`Omega EDI: ${features.isOmegaConfigured() ? 'Configured' : 'Not configured'}`);
  console.log('----------------------------------\n');
}
