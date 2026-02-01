import postgres from 'postgres';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from repo root if present
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Safe VIN run script
// - Makes a single mocked external call (simulated) for a sample VIN
// - On failure, writes a retry_queue entry directly into the DB using SQL
// - Does not call costly external services

const SAMPLE_VIN = process.env.SAFE_VIN || '1HGCM82633A004352';
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL is required to run the safe VIN script');
  process.exit(1);
}

async function run() {
  const sql = postgres(DATABASE_URL, { max: 1 });

  console.log('Starting safe VIN run for VIN:', SAMPLE_VIN);

  // Simulate VIN decoding (no external call here)
  const vehicle = { vin: SAMPLE_VIN, vinPattern: SAMPLE_VIN.substring(0,11), year: 2020, make: 'Test', model: 'E2E' };

  // Simulated external attempt counter
  let externalAttempted = 0;

  // Read SHOULD_SUCCEED from env (default true)
  const shouldSucceed = (process.env.SHOULD_SUCCEED || 'true').toLowerCase() === 'true';

  externalAttempted += 1; // single guarded external attempt
  if (shouldSucceed) {
    console.log('Mock external lookup succeeded for', SAMPLE_VIN);
    // Optionally persist a cache row (lightweight) - uses raw SQL to avoid schema imports
    try {
      await sql`INSERT INTO nags_cache (vin_pattern, year, make, model, glass_position, nags_part_number, source, created_at, updated_at) VALUES (${vehicle.vinPattern}, ${vehicle.year}, ${vehicle.make}, ${vehicle.model}, 'windshield', 'NAGS-MOCK-1', 'omega', now(), now()) ON CONFLICT DO NOTHING`;
      console.log('Inserted mock cache row');
      // Show any matching cache rows
      try {
        const rows = await sql`SELECT id, vin_pattern, glass_position, nags_part_number, source FROM nags_cache WHERE vin_pattern = ${vehicle.vinPattern}`;
        console.log('Cache rows for VIN pattern:', rows);
      } catch (err) {
        console.warn('Failed to query cache rows (ok):', err.message || err);
      }
    } catch (err) {
      console.warn('Failed to insert mock cache row (ok):', err.message || err);
    }
  } else {
    console.log('Mock external lookup failed — enqueueing retry');
    try {
      const insert = await sql`INSERT INTO retry_queue (operation, payload, attempts, max_attempts, next_attempt_at, last_error, is_dead_letter, created_at, updated_at) VALUES ('nags_lookup', ${JSON.stringify({ vin: SAMPLE_VIN })}, 0, 5, now(), NULL, false, now(), now()) RETURNING id`;
      console.log('Retry queued with id:', insert[0].id);
      try {
        const rows = await sql`SELECT id, operation, payload, attempts, next_attempt_at, is_dead_letter FROM retry_queue WHERE id = ${insert[0].id}`;
        console.log('Inserted retry row:', rows[0]);
      } catch (qerr) {
        console.warn('Failed to query retry row (ok):', qerr.message || qerr);
      }
    } catch (err) {
      console.error('Failed to enqueue retry:', err.message || err);
    }
  }

  console.log('External attempts:', externalAttempted);
  await sql.end({ timeout: 5 });
}

run().catch((err) => {
  console.error('Safe VIN run failed:', err);
  process.exit(1);
});
