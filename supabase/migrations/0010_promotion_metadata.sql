-- =============================================================================
-- Migration: 0010_promotion_metadata.sql
-- Description: Add columns for data-miner promotion tracking
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Add provenance tracking columns to stores
-- These columns track where data came from and when it was promoted
-- -----------------------------------------------------------------------------

-- Source: Which system provided this data (outscraper, apify, manual, etc.)
ALTER TABLE stores ADD COLUMN IF NOT EXISTS source VARCHAR(50);

-- Batch ID: Which import batch this record belongs to (for rollback)
ALTER TABLE stores ADD COLUMN IF NOT EXISTS batch_id VARCHAR(100);

-- Google Place ID: Unique identifier for deduplication across imports
ALTER TABLE stores ADD COLUMN IF NOT EXISTS google_place_id VARCHAR(255);

-- Ingested at: When the data was promoted from staging to production
ALTER TABLE stores ADD COLUMN IF NOT EXISTS ingested_at TIMESTAMPTZ;

-- Promotion metadata: Full audit trail for data promotion
ALTER TABLE stores ADD COLUMN IF NOT EXISTS promotion_metadata JSONB;

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------

-- Index for batch-based queries (e.g., rollback a specific batch)
CREATE INDEX IF NOT EXISTS idx_stores_batch_id ON stores(batch_id);

-- Index for source-based queries (e.g., "all outscraper imports")
CREATE INDEX IF NOT EXISTS idx_stores_source ON stores(source);

-- Unique index for Google Place ID (prevents duplicate imports)
CREATE UNIQUE INDEX IF NOT EXISTS idx_stores_google_place_id
  ON stores(google_place_id)
  WHERE google_place_id IS NOT NULL;

-- -----------------------------------------------------------------------------
-- Backfill existing data
-- -----------------------------------------------------------------------------

-- Existing stores have no source tracking, mark as 'legacy'
UPDATE stores SET source = 'legacy' WHERE source IS NULL;

-- -----------------------------------------------------------------------------
-- Comments
-- -----------------------------------------------------------------------------

COMMENT ON COLUMN stores.source IS
  'Data source: outscraper, apify, manual, legacy';

COMMENT ON COLUMN stores.batch_id IS
  'Import batch identifier for grouped rollback (e.g., sdf-batch-0-6)';

COMMENT ON COLUMN stores.google_place_id IS
  'Google Maps Place ID for cross-import deduplication';

COMMENT ON COLUMN stores.ingested_at IS
  'Timestamp when data was promoted from staging to production';

COMMENT ON COLUMN stores.promotion_metadata IS
  'JSON audit trail: promoted_by, promoted_at, source_batch_id, confidence_threshold, original_confidence';
