-- Migration: Remove Stripe infrastructure
-- This migration removes all Stripe-related tables and columns
-- as part of the pivot to content + AdSense monetization.

-- Drop Stripe tables
DROP TABLE IF EXISTS stripe_webhook_events;
DROP TABLE IF EXISTS subscriptions;

-- Drop Stripe columns from stores
ALTER TABLE stores DROP COLUMN IF EXISTS is_featured;
ALTER TABLE stores DROP COLUMN IF EXISTS featured_tier;
ALTER TABLE stores DROP COLUMN IF EXISTS featured_until;

-- Drop Stripe column from profiles
ALTER TABLE profiles DROP COLUMN IF EXISTS stripe_customer_id;
