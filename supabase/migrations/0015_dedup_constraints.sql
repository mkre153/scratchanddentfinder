-- Migration: Deduplication Constraints
-- Adds unique constraints AFTER duplicate cleanup
-- Run this ONLY after merge-duplicates.ts has been executed

-- Unique address hash (partial - only active stores)
-- Prevents two active stores at the same normalized address
CREATE UNIQUE INDEX IF NOT EXISTS unique_address_hash_active
ON stores (address_hash)
WHERE address_hash IS NOT NULL AND (is_archived = FALSE OR is_archived IS NULL);

-- Unique phone (partial - only active stores)
-- Prevents two active stores with the same phone number
CREATE UNIQUE INDEX IF NOT EXISTS unique_phone_normalized_active
ON stores (phone_normalized)
WHERE phone_normalized IS NOT NULL AND (is_archived = FALSE OR is_archived IS NULL);

-- Note: google_place_id unique index already exists from migration 0010
-- This adds additional dedup protection at the address and phone level

COMMENT ON INDEX unique_address_hash_active IS 'Prevents duplicate stores at same normalized address (active stores only)';
COMMENT ON INDEX unique_phone_normalized_active IS 'Prevents duplicate stores with same phone (active stores only)';
