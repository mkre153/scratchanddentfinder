-- Slice 10: Operator Control + Monetization Readiness
-- Migration: 0004_operator_control
-- Created: 2026-01-13
--
-- This migration adds:
-- 1. store_claims table (audit trail for ownership claims)
-- 2. cta_events table (raw CTA event persistence)
-- 3. claimed_by/claimed_at fields on stores (derived from approved claims)
-- 4. admin_users table (role-based auth)

-- =============================================================================
-- Store Claims (Audit Table)
-- =============================================================================

CREATE TABLE IF NOT EXISTS store_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX idx_store_claims_store_id ON store_claims(store_id);
CREATE INDEX idx_store_claims_user_id ON store_claims(user_id);
CREATE INDEX idx_store_claims_status ON store_claims(status);
CREATE INDEX idx_store_claims_created_at ON store_claims(created_at DESC);

-- =============================================================================
-- CTA Events (Raw Event Persistence)
-- =============================================================================

CREATE TABLE IF NOT EXISTS cta_events (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('call', 'directions', 'website')),
  source_page TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cta_events_store_id ON cta_events(store_id);
CREATE INDEX idx_cta_events_event_type ON cta_events(event_type);
CREATE INDEX idx_cta_events_created_at ON cta_events(created_at DESC);
CREATE INDEX idx_cta_events_store_date ON cta_events(store_id, created_at DESC);

-- =============================================================================
-- Add claimed_by/claimed_at to stores (derived fields)
-- =============================================================================

ALTER TABLE stores ADD COLUMN IF NOT EXISTS claimed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ;

CREATE INDEX idx_stores_claimed_by ON stores(claimed_by) WHERE claimed_by IS NOT NULL;

-- =============================================================================
-- Admin Users (Role-Based Auth)
-- =============================================================================

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX idx_admin_users_role ON admin_users(role);

-- =============================================================================
-- Trigger: Sync stores.claimed_by when claim is approved
-- =============================================================================

CREATE OR REPLACE FUNCTION sync_store_claim_status()
RETURNS TRIGGER AS $$
BEGIN
  -- When a claim is approved, update the store
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    UPDATE stores
    SET claimed_by = NEW.user_id,
        claimed_at = NOW()
    WHERE id = NEW.store_id;
  END IF;

  -- When a claim is rejected or reverted, clear if this was the approved claim
  IF NEW.status IN ('rejected', 'pending') AND OLD.status = 'approved' THEN
    UPDATE stores
    SET claimed_by = NULL,
        claimed_at = NULL
    WHERE id = NEW.store_id AND claimed_by = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_store_claim_on_update
  AFTER UPDATE OF status ON store_claims
  FOR EACH ROW
  EXECUTE FUNCTION sync_store_claim_status();

-- =============================================================================
-- Row Level Security
-- =============================================================================

ALTER TABLE store_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE cta_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Store claims: users can see their own claims
CREATE POLICY "Users can read own claims"
  ON store_claims FOR SELECT USING (auth.uid() = user_id);

-- CTA events: service role only (no public access)
-- Events are written by server, aggregated for reporting

-- Admin users: service role only
-- Checked via isAdmin() query in application code

-- =============================================================================
-- Comments
-- =============================================================================

COMMENT ON TABLE store_claims IS 'Audit trail for store ownership claims. stores.claimed_by is derived from approved claims.';
COMMENT ON TABLE cta_events IS 'Raw CTA event persistence. Leads table can derive from this.';
COMMENT ON TABLE admin_users IS 'Role-based admin access control.';
COMMENT ON COLUMN stores.claimed_by IS 'Derived from approved store_claims. Do not update directly.';
COMMENT ON COLUMN stores.claimed_at IS 'Derived from approved store_claims. Do not update directly.';
