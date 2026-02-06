-- Migration: Add NAGS cache and supporting tables
-- Generated: 2026-02-05

CREATE TABLE IF NOT EXISTS nags_cache (
  id SERIAL PRIMARY KEY,
  vin_pattern VARCHAR(11) NOT NULL,
  year INTEGER NOT NULL,
  make VARCHAR(50) NOT NULL,
  model VARCHAR(50) NOT NULL,
  trim VARCHAR(50),
  body_style VARCHAR(50),
  glass_position VARCHAR(30) NOT NULL,
  nags_part_number VARCHAR(20) NOT NULL,
  nags_part_number_alt VARCHAR(20),
  features JSONB,
  last_known_cost INTEGER,
  last_price_date TIMESTAMP,
  distributor_source VARCHAR(30),
  source VARCHAR(30) NOT NULL,
  confidence INTEGER DEFAULT 100,
  verified BOOLEAN DEFAULT FALSE,
  verified_by VARCHAR(50),
  verified_at TIMESTAMP,
  lookup_count INTEGER DEFAULT 0,
  last_lookup_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_nags_cache_vin_pattern ON nags_cache (vin_pattern);
CREATE INDEX IF NOT EXISTS idx_nags_cache_vehicle ON nags_cache (year, make, model);
CREATE INDEX IF NOT EXISTS idx_nags_cache_nags ON nags_cache (nags_part_number);
CREATE INDEX IF NOT EXISTS idx_nags_cache_lookup ON nags_cache (vin_pattern, glass_position);

CREATE TABLE IF NOT EXISTS nags_manual_queue (
  id SERIAL PRIMARY KEY,
  vin VARCHAR(17) NOT NULL,
  glass_position VARCHAR(30) NOT NULL,
  year INTEGER,
  make VARCHAR(50),
  model VARCHAR(50),
  transaction_id INTEGER,
  customer_name VARCHAR(100),
  customer_phone VARCHAR(20),
  urgency VARCHAR(20) DEFAULT 'normal',
  attempt_log JSONB,
  status VARCHAR(20) DEFAULT 'pending',
  resolved_nags_number VARCHAR(20),
  resolved_by VARCHAR(50),
  resolved_at TIMESTAMP,
  resolution_source VARCHAR(30),
  resolution_notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS distributor_credentials (
  id SERIAL PRIMARY KEY,
  distributor VARCHAR(30) NOT NULL,
  login_url VARCHAR(255) NOT NULL,
  username VARCHAR(100) NOT NULL,
  password_encrypted VARCHAR(255) NOT NULL,
  session_token TEXT,
  session_expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  last_success_at TIMESTAMP,
  last_failure_at TIMESTAMP,
  failure_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS nags_lookup_log (
  id SERIAL PRIMARY KEY,
  vin VARCHAR(17) NOT NULL,
  glass_position VARCHAR(30) NOT NULL,
  resolved_by_tier INTEGER,
  resolved_by_source VARCHAR(30),
  total_duration_ms INTEGER,
  tier1_duration_ms INTEGER,
  tier2_duration_ms INTEGER,
  tier3_duration_ms INTEGER,
  success BOOLEAN NOT NULL,
  nags_part_number VARCHAR(20),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT now()
);
