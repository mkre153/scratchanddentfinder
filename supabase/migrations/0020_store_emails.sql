-- Store Email Outreach Tables
-- Migration: 0020_store_emails
-- Created: 2026-02-11
--
-- Two tables for store owner email outreach:
-- 1. store_emails: scraped contact emails from store websites
-- 2. outreach_drips: 4-step drip sequence tracking

-- =============================================================================
-- Store Emails
-- =============================================================================

CREATE TABLE store_emails (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  store_id INTEGER NOT NULL REFERENCES stores(id),
  email TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'website_scrape',
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  bounced BOOLEAN DEFAULT FALSE,
  UNIQUE(store_id, email)
);

CREATE INDEX idx_store_emails_active ON store_emails(store_id)
  WHERE unsubscribed_at IS NULL AND bounced = FALSE;

-- =============================================================================
-- Outreach Drips
-- =============================================================================

CREATE TABLE outreach_drips (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  store_email_id BIGINT NOT NULL REFERENCES store_emails(id),
  step INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_email_id, step)
);

CREATE INDEX idx_outreach_drips_pending ON outreach_drips(scheduled_for)
  WHERE status = 'pending';
