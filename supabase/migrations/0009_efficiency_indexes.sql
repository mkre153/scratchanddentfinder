-- =============================================================================
-- Pre-Deploy Efficiency Audit: Missing Indexes
-- =============================================================================
-- Migration: 0009_efficiency_indexes
-- Created: 2026-01-14
--
-- Adds missing indexes identified during pre-deploy efficiency audit.
-- These indexes support hot paths in webhook processing.

-- Index for subscription lookup by Stripe subscription ID
-- Used in: webhook handlers (subscription.updated, subscription.deleted)
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id
  ON subscriptions(stripe_subscription_id);

-- Note: All other required indexes already exist from 0001_init.sql:
-- - stores(city_id) ✓
-- - stores(state_id) ✓
-- - stores(is_approved) ✓
-- - cities(state_id) ✓
-- - cities(state_code) ✓
-- - subscriptions(user_id, store_id, status) ✓
-- - stripe_webhook_events(processed_at) ✓ (from 0006)
