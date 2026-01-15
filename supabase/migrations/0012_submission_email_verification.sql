-- Migration: 0012_submission_email_verification
-- Created: 2026-01-15
--
-- Adds email verification fields to store_submissions
-- Enables 6-digit code verification flow before admin review

-- Add email and verification fields
ALTER TABLE store_submissions
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verification_code_hash TEXT,
ADD COLUMN IF NOT EXISTS verification_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verification_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS google_place_id TEXT;

-- Index for looking up pending verifications
CREATE INDEX IF NOT EXISTS idx_store_submissions_verification
ON store_submissions(id, verification_expires_at)
WHERE email_verified_at IS NULL;

-- Comments
COMMENT ON COLUMN store_submissions.email IS 'Submitter email address (required for new submissions)';
COMMENT ON COLUMN store_submissions.email_verified_at IS 'Timestamp when email was verified via 6-digit code';
COMMENT ON COLUMN store_submissions.verification_code_hash IS 'Hashed 6-digit verification code';
COMMENT ON COLUMN store_submissions.verification_expires_at IS 'Code expiration (10 minutes from send)';
COMMENT ON COLUMN store_submissions.verification_attempts IS 'Number of verification attempts (max 5)';
COMMENT ON COLUMN store_submissions.google_place_id IS 'Google Places ID if auto-filled from Places API';
