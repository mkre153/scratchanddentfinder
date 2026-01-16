-- Migration: Deduplication Infrastructure
-- Adds columns for address normalization, soft-archiving, and SEO redirects

-- Address normalization columns
ALTER TABLE stores ADD COLUMN IF NOT EXISTS address_hash VARCHAR(64);
ALTER TABLE stores ADD COLUMN IF NOT EXISTS phone_normalized VARCHAR(20);

-- Soft-archive columns (never delete, just archive)
ALTER TABLE stores ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS archived_reason VARCHAR(50);
ALTER TABLE stores ADD COLUMN IF NOT EXISTS merged_into_store_id INTEGER REFERENCES stores(id);

-- Indexes for dedup queries (not unique yet - added after cleanup)
CREATE INDEX IF NOT EXISTS idx_stores_address_hash ON stores(address_hash) WHERE address_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_stores_phone_normalized ON stores(phone_normalized) WHERE phone_normalized IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_stores_archived ON stores(is_archived) WHERE is_archived = TRUE;

-- Slug redirects table for SEO preservation when merging duplicates
CREATE TABLE IF NOT EXISTS store_slug_redirects (
  old_slug VARCHAR(300) PRIMARY KEY,
  canonical_store_id INTEGER NOT NULL REFERENCES stores(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update public directory query to exclude archived stores
-- All queries should include: WHERE is_archived = FALSE (or IS NULL for safety)
COMMENT ON COLUMN stores.is_archived IS 'Soft-delete flag. Archived stores excluded from public directory.';
COMMENT ON COLUMN stores.merged_into_store_id IS 'Points to canonical store when this record was merged as duplicate.';
COMMENT ON COLUMN stores.address_hash IS 'SHA256 hash of normalized address for deduplication.';
