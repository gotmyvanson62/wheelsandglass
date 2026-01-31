import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from 'shared';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// For serverless environments (Vercel), use a pooled connection
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL!;

if (!connectionString) {
  throw new Error('DATABASE_URL or POSTGRES_URL environment variable is required');
}

// Create a connection with proper pooling for serverless
// In serverless: 1 connection per function instance
// In development: more connections for better performance
const queryClient = postgres(connectionString, {
  max: process.env.NODE_ENV === 'production' ? 1 : 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(queryClient, { schema });

// For migrations (non-pooled connection)
export const migrationClient = postgres(
  process.env.DATABASE_URL_NON_POOLING ||
  process.env.POSTGRES_URL_NON_POOLING ||
  connectionString,
  { max: 1 }
);

export const migrationDb = drizzle(migrationClient, { schema });
