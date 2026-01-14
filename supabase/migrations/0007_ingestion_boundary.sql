-- =============================================================================
-- Migration: 0007_ingestion_boundary.sql
-- Description: Ingestion boundary infrastructure
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Ingestion Log Table
-- Records all data ingestion operations for audit trail
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS ingestion_log (
  id SERIAL PRIMARY KEY,
  operation VARCHAR(50) NOT NULL,
  source VARCHAR(255) NOT NULL,
  records_affected INTEGER NOT NULL,
  initiated_by VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for time-based queries (e.g., "what was imported recently?")
CREATE INDEX idx_ingestion_log_created_at ON ingestion_log(created_at);

-- Index for operation-based queries (e.g., "all apify imports")
CREATE INDEX idx_ingestion_log_operation ON ingestion_log(operation);

-- -----------------------------------------------------------------------------
-- Add is_verified column to stores
-- Tracks data that entered through the trusted ingestion boundary
-- -----------------------------------------------------------------------------

ALTER TABLE stores ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- Backfill: All existing stores are verified (they came from Apify)
-- This is safe because all existing data was imported through scripts
UPDATE stores SET is_verified = true WHERE is_verified IS NULL OR is_verified = false;

-- Partial index for queries that filter by verification status
-- Only indexes verified stores since that's the common query pattern
CREATE INDEX idx_stores_is_verified ON stores(is_verified) WHERE is_verified = true;

-- -----------------------------------------------------------------------------
-- Comments for documentation
-- -----------------------------------------------------------------------------

COMMENT ON TABLE ingestion_log IS 'Audit trail for all data ingestion operations';
COMMENT ON COLUMN ingestion_log.operation IS 'Type of ingestion: apify_import, submission_approved';
COMMENT ON COLUMN ingestion_log.source IS 'Source identifier: filename or submission ID';
COMMENT ON COLUMN ingestion_log.records_affected IS 'Number of records created/updated';
COMMENT ON COLUMN ingestion_log.initiated_by IS 'User or script that initiated the operation';

COMMENT ON COLUMN stores.is_verified IS 'True if data entered through trusted ingestion boundary. All stores visible in directory must have is_verified = true AND is_approved = true.';
