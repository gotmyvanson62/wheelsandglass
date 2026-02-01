import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import postgres from 'postgres';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

async function run() {
  const sqlClient = postgres(DATABASE_URL, { max: 1 });
  const sqlFile = path.resolve(__dirname, '../src/db/drizzle/20260201_add_status_history_and_retry_queue.sql');
  const sql = fs.readFileSync(sqlFile, 'utf-8');
  try {
    console.log('Applying retry table SQL...');
    await sqlClient.begin(async (tx) => {
      await tx.unsafe(sql);
    });
    console.log('Applied SQL successfully.');
  } catch (err) {
    console.error('Failed to apply SQL:', err.message || err);
  } finally {
    await sqlClient.end({ timeout: 5 });
  }
}

run().catch((err) => { console.error(err); process.exit(1); });
