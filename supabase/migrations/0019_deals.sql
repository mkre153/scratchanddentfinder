-- Migration: Deals Marketplace
-- Creates the deals table for scratch & dent deal listings

CREATE TABLE deals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id integer REFERENCES stores(id) ON DELETE SET NULL,
  submitter_email text NOT NULL,
  submitter_name text NOT NULL,
  submitter_phone text,
  -- Email verification
  verification_code_hash text,
  verification_expires_at timestamptz,
  verification_attempts integer DEFAULT 0,
  email_verified_at timestamptz,
  -- Deal details
  title text NOT NULL,
  description text NOT NULL,
  appliance_type text NOT NULL,
  brand text,
  model_number text,
  original_price integer,
  deal_price integer NOT NULL,
  damage_description text NOT NULL,
  condition text NOT NULL DEFAULT 'good',
  -- Location
  city text NOT NULL,
  state text NOT NULL,
  zip text,
  -- Photos
  photo_paths text[] DEFAULT '{}',
  -- Moderation
  moderation_status text NOT NULL DEFAULT 'pending',
  moderation_flags jsonb DEFAULT '{}',
  moderation_reviewed_by text,
  moderation_reviewed_at timestamptz,
  -- Lifecycle
  status text NOT NULL DEFAULT 'draft',
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_deals_status_state ON deals(status, state) WHERE status = 'active';
CREATE INDEX idx_deals_status_city ON deals(status, city, state) WHERE status = 'active';
CREATE INDEX idx_deals_appliance ON deals(appliance_type, status) WHERE status = 'active';
CREATE INDEX idx_deals_expires ON deals(expires_at) WHERE status = 'active';
CREATE INDEX idx_deals_moderation ON deals(moderation_status) WHERE moderation_status = 'flagged';
