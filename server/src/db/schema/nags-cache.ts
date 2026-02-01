import { pgTable, serial, varchar, integer, text, boolean, timestamp, jsonb, index } from 'drizzle-orm/pg-core';

// Main NAGS parts cache
export const nagsCache = pgTable('nags_cache', {
  id: serial('id').primaryKey(),
  vinPattern: varchar('vin_pattern', { length: 11 }).notNull(),
  year: integer('year').notNull(),
  make: varchar('make', { length: 50 }).notNull(),
  model: varchar('model', { length: 50 }).notNull(),
  trim: varchar('trim', { length: 50 }),
  bodyStyle: varchar('body_style', { length: 50 }),
  glassPosition: varchar('glass_position', { length: 30 }).notNull(),
  nagsPartNumber: varchar('nags_part_number', { length: 20 }).notNull(),
  nagsPartNumberAlt: varchar('nags_part_number_alt', { length: 20 }),
  features: jsonb('features'),
  lastKnownCost: integer('last_known_cost'),
  lastPriceDate: timestamp('last_price_date'),
  distributorSource: varchar('distributor_source', { length: 30 }),
  source: varchar('source', { length: 30 }).notNull(),
  confidence: integer('confidence').default(100),
  verified: boolean('verified').default(false),
  verifiedBy: varchar('verified_by', { length: 50 }),
  verifiedAt: timestamp('verified_at'),
  lookupCount: integer('lookup_count').default(0),
  lastLookupAt: timestamp('last_lookup_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  vinPatternIdx: index('idx_nags_cache_vin_pattern').on(table.vinPattern),
  vehicleIdx: index('idx_nags_cache_vehicle').on(table.year, table.make, table.model),
  nagsIdx: index('idx_nags_cache_nags').on(table.nagsPartNumber),
  lookupIdx: index('idx_nags_cache_lookup').on(table.vinPattern, table.glassPosition),
}));

// Manual escalation queue
export const nagsManualQueue = pgTable('nags_manual_queue', {
  id: serial('id').primaryKey(),
  vin: varchar('vin', { length: 17 }).notNull(),
  glassPosition: varchar('glass_position', { length: 30 }).notNull(),
  year: integer('year'),
  make: varchar('make', { length: 50 }),
  model: varchar('model', { length: 50 }),
  transactionId: integer('transaction_id'),
  customerName: varchar('customer_name', { length: 100 }),
  customerPhone: varchar('customer_phone', { length: 20 }),
  urgency: varchar('urgency', { length: 20 }).default('normal'),
  attemptLog: jsonb('attempt_log'),
  status: varchar('status', { length: 20 }).default('pending'),
  resolvedNagsNumber: varchar('resolved_nags_number', { length: 20 }),
  resolvedBy: varchar('resolved_by', { length: 50 }),
  resolvedAt: timestamp('resolved_at'),
  resolutionSource: varchar('resolution_source', { length: 30 }),
  resolutionNotes: text('resolution_notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Distributor credentials (encrypted)
export const distributorCredentials = pgTable('distributor_credentials', {
  id: serial('id').primaryKey(),
  distributor: varchar('distributor', { length: 30 }).notNull(),
  loginUrl: varchar('login_url', { length: 255 }).notNull(),
  username: varchar('username', { length: 100 }).notNull(),
  passwordEncrypted: varchar('password_encrypted', { length: 255 }).notNull(),
  sessionToken: text('session_token'),
  sessionExpiresAt: timestamp('session_expires_at'),
  isActive: boolean('is_active').default(true),
  lastSuccessAt: timestamp('last_success_at'),
  lastFailureAt: timestamp('last_failure_at'),
  failureCount: integer('failure_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Lookup analytics
export const nagsLookupLog = pgTable('nags_lookup_log', {
  id: serial('id').primaryKey(),
  vin: varchar('vin', { length: 17 }).notNull(),
  glassPosition: varchar('glass_position', { length: 30 }).notNull(),
  resolvedByTier: integer('resolved_by_tier'),
  resolvedBySource: varchar('resolved_by_source', { length: 30 }),
  totalDurationMs: integer('total_duration_ms'),
  tier1DurationMs: integer('tier1_duration_ms'),
  tier2DurationMs: integer('tier2_duration_ms'),
  tier3DurationMs: integer('tier3_duration_ms'),
  success: boolean('success').notNull(),
  nagsPartNumber: varchar('nags_part_number', { length: 20 }),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow(),
});
