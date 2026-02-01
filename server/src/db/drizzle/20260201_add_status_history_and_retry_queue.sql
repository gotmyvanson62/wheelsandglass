-- Migration: Add status_history to transactions and create retry_queue table

BEGIN;

-- Add status_history column to transactions (jsonb array)
ALTER TABLE IF EXISTS transactions
  ADD COLUMN IF NOT EXISTS status_history jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Create persistent retry queue table
CREATE TABLE IF NOT EXISTS retry_queue (
  id serial PRIMARY KEY,
  operation text NOT NULL,
  payload jsonb NOT NULL,
  attempts integer NOT NULL DEFAULT 0,
  max_attempts integer NOT NULL DEFAULT 5,
  next_attempt_at timestamp with time zone,
  last_error text,
  is_dead_letter boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

COMMIT;
