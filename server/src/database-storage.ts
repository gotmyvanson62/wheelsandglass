// Database storage implementation stub
// In development mode, the application uses MemStorage instead
// This file exists to satisfy the import in storage.ts

import type { IStorage } from './storage.js';

/**
 * DatabaseStorage placeholder for production use with PostgreSQL
 * Currently stubbed - throws error if accidentally used
 * The application uses MemStorage in development (NODE_ENV !== 'production')
 */
export class DatabaseStorage implements Partial<IStorage> {
  constructor() {
    throw new Error(
      'DatabaseStorage is not implemented. Use MemStorage for development or configure a database for production.'
    );
  }

  async resetAllData(): Promise<void> {
    throw new Error('DatabaseStorage is not implemented');
  }
}
