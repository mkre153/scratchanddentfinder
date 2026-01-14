-- =============================================================================
-- Slice 13: Stripe Integration
-- =============================================================================
--
-- This migration:
-- 1. Removes 'lifetime' from tier enums (product decision: recurring only)
-- 2. Adds dedicated webhook idempotency table
-- 3. Adds stripe_customer_id to profiles for customer linking
--

-- =============================================================================
-- 1. Remove 'lifetime' from tier constraints
-- =============================================================================

-- Update stores table constraint
ALTER TABLE stores DROP CONSTRAINT IF EXISTS stores_featured_tier_check;
ALTER TABLE stores ADD CONSTRAINT stores_featured_tier_check
  CHECK (featured_tier IS NULL OR featured_tier IN ('monthly', 'annual'));

-- Update subscriptions table constraint
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_tier_check;
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_tier_check
  CHECK (tier IN ('monthly', 'annual'));

-- =============================================================================
-- 2. Webhook Idempotency Table
-- =============================================================================
-- Dedicated table for tracking processed webhook events.
-- This prevents duplicate processing when Stripe retries failed webhooks.

CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  event_id VARCHAR(255) PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for cleanup queries (e.g., delete events older than 30 days)
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_processed_at
  ON stripe_webhook_events(processed_at);

-- =============================================================================
-- 3. Add stripe_customer_id to profiles
-- =============================================================================
-- Links Supabase auth users to Stripe customers for billing.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255) UNIQUE;

-- Index for lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id
  ON profiles(stripe_customer_id);

-- =============================================================================
-- 4. Add store_id to subscriptions for store-tier linking
-- =============================================================================
-- Ensures we can link a subscription to the store it's paying for.

-- First, check if the column exists (it should from 0001_init.sql)
-- If not, add it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'store_id'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN store_id INTEGER REFERENCES stores(id);
  END IF;
END $$;

-- Index for lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_store_id
  ON subscriptions(store_id);

-- =============================================================================
-- Notes
-- =============================================================================
--
-- Architectural Invariants (enforced by application code):
-- 1. checkout.session.completed → sets store tier ONLY
-- 2. customer.subscription.* → updates subscription record ONLY
-- 3. Subscription deletion does NOT clear store tier
-- 4. Tier expiration governed by featured_until date
--
-- To run: supabase db push
