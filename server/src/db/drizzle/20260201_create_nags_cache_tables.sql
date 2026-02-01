-- Migration: Create NAGS cache and related tables

BEGIN;

-- NAGS cache
CREATE TABLE IF NOT EXISTS nags_cache (
  id serial PRIMARY KEY,
  vin_pattern varchar(11) NOT NULL,
  year integer NOT NULL,
  make varchar(50) NOT NULL,
  model varchar(50) NOT NULL,
  trim varchar(50),
  body_style varchar(50),
  glass_position varchar(30) NOT NULL,
  nags_part_number varchar(20) NOT NULL,
  nags_part_number_alt varchar(20),
  features jsonb,
  last_known_cost integer,
  last_price_date timestamp with time zone,
  distributor_source varchar(30),
  source varchar(30) NOT NULL,
  confidence integer DEFAULT 100,
  verified boolean DEFAULT false,
  verified_by varchar(50),
  verified_at timestamp with time zone,
  lookup_count integer DEFAULT 0,
  last_lookup_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_nags_cache_vin_pattern ON nags_cache(vin_pattern);
CREATE INDEX IF NOT EXISTS idx_nags_cache_vehicle ON nags_cache(year, make, model);
CREATE INDEX IF NOT EXISTS idx_nags_cache_nags ON nags_cache(nags_part_number);
CREATE INDEX IF NOT EXISTS idx_nags_cache_lookup ON nags_cache(vin_pattern, glass_position);

-- Manual escalation queue
CREATE TABLE IF NOT EXISTS nags_manual_queue (
  id serial PRIMARY KEY,
  vin varchar(17) NOT NULL,
  glass_position varchar(30) NOT NULL,
  year integer,
  make varchar(50),
  model varchar(50),
  transaction_id integer,
  customer_name varchar(100),
  customer_phone varchar(20),
  urgency varchar(20) DEFAULT 'normal',
  attempt_log jsonb,
  status varchar(20) DEFAULT 'pending',
  resolved_nags_number varchar(20),
  resolved_by varchar(50),
  resolved_at timestamp with time zone,
  resolution_source varchar(30),
  resolution_notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Distributor credentials
CREATE TABLE IF NOT EXISTS distributor_credentials (
  id serial PRIMARY KEY,
  distributor varchar(30) NOT NULL UNIQUE,
  login_url varchar(255) NOT NULL,
  username varchar(100) NOT NULL,
  password_encrypted varchar(255) NOT NULL,
  session_token text,
  session_expires_at timestamp with time zone,
  is_active boolean DEFAULT true,
  last_success_at timestamp with time zone,
  last_failure_at timestamp with time zone,
  failure_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Lookup analytics
CREATE TABLE IF NOT EXISTS nags_lookup_log (
  id serial PRIMARY KEY,
  vin varchar(17) NOT NULL,
  glass_position varchar(30) NOT NULL,
  resolved_by_tier integer,
  resolved_by_source varchar(30),
  total_duration_ms integer,
  tier1_duration_ms integer,
  tier2_duration_ms integer,
  tier3_duration_ms integer,
  success boolean NOT NULL,
  nags_part_number varchar(20),
  error_message text,
  created_at timestamp with time zone DEFAULT now()
);

COMMIT;
