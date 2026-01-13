-- Slice 11: Hardening Guardrails
-- Migration: 0005_hardening
-- Created: 2026-01-13
--
-- This migration adds:
-- 1. Unique constraint for one approved claim per store
-- 2. Durable CTA rate limiting table
-- 3. RPC functions for atomic rate checking and cleanup

-- =============================================================================
-- Store Claims: One Approved Claim Per Store
-- =============================================================================

-- Partial unique index ensures only one approved claim per store
-- This is a database-level constraint (not just application logic)
CREATE UNIQUE INDEX IF NOT EXISTS idx_store_claims_one_approved
ON store_claims(store_id) WHERE status = 'approved';

COMMENT ON INDEX idx_store_claims_one_approved IS
  'Ensures only one approved claim per store. Multiple pending claims are allowed.';

-- =============================================================================
-- CTA Rate Limiting (Durable)
-- =============================================================================

-- Rate limiting table - survives deploys, cold starts, horizontal scaling
CREATE TABLE IF NOT EXISTS cta_rate_limits (
  ip_hash TEXT NOT NULL,
  store_id INTEGER NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  event_count INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (ip_hash, store_id, window_start)
);

-- Index for efficient cleanup of expired windows
CREATE INDEX IF NOT EXISTS idx_cta_rate_limits_window
ON cta_rate_limits(window_start);

-- Index for per-store queries (analytics)
CREATE INDEX IF NOT EXISTS idx_cta_rate_limits_store
ON cta_rate_limits(store_id, window_start DESC);

COMMENT ON TABLE cta_rate_limits IS
  'Durable rate limiting for CTA events. Survives deploys and horizontal scaling.';

-- =============================================================================
-- RPC: Atomic Rate Check + Increment
-- =============================================================================

-- Returns TRUE if request is allowed, FALSE if rate limited
-- Atomically checks and increments the counter in a single operation
CREATE OR REPLACE FUNCTION check_cta_rate_limit(
  p_ip_hash TEXT,
  p_store_id INTEGER,
  p_window_minutes INTEGER DEFAULT 1,
  p_max_events INTEGER DEFAULT 60
) RETURNS BOOLEAN AS $$
DECLARE
  v_window_start TIMESTAMPTZ;
  v_count INTEGER;
BEGIN
  -- Truncate to minute for window alignment
  v_window_start := date_trunc('minute', NOW());

  -- Upsert: insert new record or increment existing
  INSERT INTO cta_rate_limits (ip_hash, store_id, window_start, event_count)
  VALUES (p_ip_hash, p_store_id, v_window_start, 1)
  ON CONFLICT (ip_hash, store_id, window_start)
  DO UPDATE SET event_count = cta_rate_limits.event_count + 1
  RETURNING event_count INTO v_count;

  -- Return whether the request is allowed
  RETURN v_count <= p_max_events;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_cta_rate_limit IS
  'Atomic rate limit check and increment. Returns TRUE if allowed, FALSE if rate limited.';

-- =============================================================================
-- RPC: Cleanup Expired Windows
-- =============================================================================

-- Call periodically to clean up old rate limit records
-- Returns number of deleted records
CREATE OR REPLACE FUNCTION cleanup_cta_rate_limits(
  p_older_than_minutes INTEGER DEFAULT 60
) RETURNS INTEGER AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM cta_rate_limits
  WHERE window_start < NOW() - (p_older_than_minutes || ' minutes')::INTERVAL;

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_cta_rate_limits IS
  'Cleanup old rate limit records. Default retention is 60 minutes.';

-- =============================================================================
-- RPC: Check Store Rate Limit (Hourly)
-- =============================================================================

-- Separate rate limit for per-store abuse (1000 events/hour from any IP)
CREATE OR REPLACE FUNCTION check_store_hourly_rate_limit(
  p_store_id INTEGER,
  p_max_events INTEGER DEFAULT 1000
) RETURNS BOOLEAN AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COALESCE(SUM(event_count), 0) INTO v_count
  FROM cta_rate_limits
  WHERE store_id = p_store_id
    AND window_start > NOW() - INTERVAL '1 hour';

  RETURN v_count < p_max_events;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_store_hourly_rate_limit IS
  'Check hourly rate limit for a store across all IPs. Default is 1000 events/hour.';

-- =============================================================================
-- Row Level Security
-- =============================================================================

ALTER TABLE cta_rate_limits ENABLE ROW LEVEL SECURITY;

-- Only service role can access rate limits
-- No public access to rate limiting data

-- =============================================================================
-- Comments
-- =============================================================================

COMMENT ON COLUMN cta_rate_limits.ip_hash IS 'SHA-256 hash of IP address (privacy-preserving)';
COMMENT ON COLUMN cta_rate_limits.store_id IS 'Store being rate-limited for this IP';
COMMENT ON COLUMN cta_rate_limits.window_start IS 'Start of the rate limit window (truncated to minute)';
COMMENT ON COLUMN cta_rate_limits.event_count IS 'Number of events in this window';
