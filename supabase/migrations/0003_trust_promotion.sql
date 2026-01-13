-- =============================================================================
-- Slice 6: Trust Promotion (Manual Approval)
-- =============================================================================
--
-- Adds rejected_at for soft reject audit trail.
-- No other schema changes.
--

ALTER TABLE store_submissions ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ;
