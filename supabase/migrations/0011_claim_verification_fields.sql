-- Migration: 0011_claim_verification_fields
-- Created: 2026-01-15
--
-- Adds verification fields to store_claims for collecting claimer information
-- This allows admins to verify ownership before approving claims

ALTER TABLE store_claims ADD COLUMN IF NOT EXISTS claimer_name TEXT;
ALTER TABLE store_claims ADD COLUMN IF NOT EXISTS claimer_email TEXT;
ALTER TABLE store_claims ADD COLUMN IF NOT EXISTS claimer_phone TEXT;
ALTER TABLE store_claims ADD COLUMN IF NOT EXISTS claimer_relationship TEXT CHECK (claimer_relationship IN ('owner', 'manager', 'employee', 'other'));
ALTER TABLE store_claims ADD COLUMN IF NOT EXISTS verification_notes TEXT;

COMMENT ON COLUMN store_claims.claimer_name IS 'Full name of person claiming the business';
COMMENT ON COLUMN store_claims.claimer_email IS 'Contact email for verification';
COMMENT ON COLUMN store_claims.claimer_phone IS 'Contact phone for verification';
COMMENT ON COLUMN store_claims.claimer_relationship IS 'Relationship to the business (owner, manager, employee, other)';
COMMENT ON COLUMN store_claims.verification_notes IS 'User-provided description of how they can verify ownership';
