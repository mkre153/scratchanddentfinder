-- =============================================================================
-- Add Zipcode to Store Submissions
-- =============================================================================

ALTER TABLE store_submissions
ADD COLUMN IF NOT EXISTS zipcode TEXT;
