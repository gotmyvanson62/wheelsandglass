import postgres from 'postgres';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const DATABASE_URL = process.env.DATABASE_URL;
const THRESHOLD = parseInt(process.env.RETRY_QUEUE_THRESHOLD || '50', 10);

if (!DATABASE_URL) {
  console.error('DATABASE_URL is required');
  process.exit(2);
}

async function run() {
  const sql = postgres(DATABASE_URL, { max: 1 });
  try {
    const [{ count }] = await sql`SELECT count(*)::int as count FROM retry_queue WHERE is_dead_letter = false`;
    const n = Number(count || 0);
    console.log(`Retry queue size: ${n}`);
    if (n > THRESHOLD) {
      console.error(`Retry queue exceeds threshold (${THRESHOLD}). Current: ${n}`);
      process.exit(3);
    }
    console.log('Retry queue within threshold.');
  } catch (err) {
    console.error('Failed to check retry queue:', err.message || err);
    process.exit(4);
  } finally {
    await sql.end({ timeout: 5 });
  }
}

run();
