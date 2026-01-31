import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { migrationDb, migrationClient } from './connection.js';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

async function runMigrations() {
  console.log('Running migrations...');

  try {
    await migrate(migrationDb, {
      migrationsFolder: './drizzle',
    });

    console.log('Migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await migrationClient.end();
  }
}

runMigrations().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
