import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Database is optional in development (uses MemStorage)
// Required in production
let pool: Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

if (process.env.DATABASE_URL) {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle(pool, { schema });
} else if (process.env.NODE_ENV === 'production') {
  throw new Error(
    "DATABASE_URL must be set in production. Did you forget to provision a database?",
  );
} else {
  console.log('No DATABASE_URL set - using in-memory storage for development');
}

export { pool, db };
