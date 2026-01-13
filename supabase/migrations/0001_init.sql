-- Scratch and Dent Finder Database Schema
-- Migration: 0001_init
-- Created: 2026-01-12

-- =============================================================================
-- States
-- =============================================================================

CREATE TABLE IF NOT EXISTS states (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  emoji VARCHAR(10) NOT NULL DEFAULT '🏠',
  gradient_color VARCHAR(50) NOT NULL DEFAULT 'blue',
  store_count INTEGER NOT NULL DEFAULT 0,
  city_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_states_slug ON states(slug);
CREATE INDEX idx_states_name ON states(name);

-- =============================================================================
-- Cities
-- =============================================================================

CREATE TABLE IF NOT EXISTS cities (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(100) NOT NULL,
  name VARCHAR(100) NOT NULL,
  state_id INTEGER NOT NULL REFERENCES states(id) ON DELETE CASCADE,
  state_code VARCHAR(2) NOT NULL,
  lat DECIMAL(10, 7),
  lng DECIMAL(10, 7),
  store_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(state_code, slug)
);

CREATE INDEX idx_cities_slug ON cities(slug);
CREATE INDEX idx_cities_state_id ON cities(state_id);
CREATE INDEX idx_cities_state_code ON cities(state_code);
CREATE INDEX idx_cities_store_count ON cities(store_count DESC);
CREATE INDEX idx_cities_coords ON cities(lat, lng) WHERE lat IS NOT NULL AND lng IS NOT NULL;

-- =============================================================================
-- Stores
-- =============================================================================

CREATE TABLE IF NOT EXISTS stores (
  id SERIAL PRIMARY KEY,
  place_id VARCHAR(255) NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(300) NOT NULL,
  address TEXT NOT NULL,
  city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  state_id INTEGER NOT NULL REFERENCES states(id) ON DELETE CASCADE,
  zip VARCHAR(20),
  phone VARCHAR(30),
  website TEXT,
  description TEXT,
  hours JSONB,
  appliances JSONB,
  services JSONB,
  rating DECIMAL(2, 1),
  review_count INTEGER DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  featured_tier VARCHAR(20) CHECK (featured_tier IN ('monthly', 'annual', 'lifetime')),
  featured_until TIMESTAMPTZ,
  lat DECIMAL(10, 7),
  lng DECIMAL(10, 7),
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_stores_place_id ON stores(place_id);
CREATE INDEX idx_stores_slug ON stores(slug);
CREATE INDEX idx_stores_city_id ON stores(city_id);
CREATE INDEX idx_stores_state_id ON stores(state_id);
CREATE INDEX idx_stores_is_approved ON stores(is_approved);
CREATE INDEX idx_stores_is_featured ON stores(is_featured DESC);
CREATE INDEX idx_stores_coords ON stores(lat, lng) WHERE lat IS NOT NULL AND lng IS NOT NULL;

-- =============================================================================
-- Profiles (extends auth.users)
-- =============================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  is_store_owner BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- Subscriptions (Stripe sync)
-- =============================================================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  stripe_customer_id VARCHAR(255) NOT NULL,
  stripe_subscription_id VARCHAR(255),
  tier VARCHAR(20) NOT NULL CHECK (tier IN ('monthly', 'annual', 'lifetime')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'incomplete')),
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_store_id ON subscriptions(store_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- =============================================================================
-- Leads (CTA tracking)
-- =============================================================================

CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  source_url TEXT NOT NULL,
  source_page_type VARCHAR(20) CHECK (source_page_type IN ('city', 'state')),
  cta_type VARCHAR(20) CHECK (cta_type IN ('call', 'directions', 'website')),
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_leads_store_id ON leads(store_id);
CREATE INDEX idx_leads_cta_type ON leads(cta_type);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);

-- =============================================================================
-- Contact Submissions
-- =============================================================================

CREATE TABLE IF NOT EXISTS contact_submissions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contact_submissions_is_read ON contact_submissions(is_read);
CREATE INDEX idx_contact_submissions_created_at ON contact_submissions(created_at DESC);

-- =============================================================================
-- Triggers for updated_at
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stores_updated_at
  BEFORE UPDATE ON stores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- Row Level Security (RLS)
-- =============================================================================

ALTER TABLE states ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Public read access for directory data
CREATE POLICY "Public read access for states"
  ON states FOR SELECT USING (true);

CREATE POLICY "Public read access for cities"
  ON cities FOR SELECT USING (true);

CREATE POLICY "Public read access for approved stores"
  ON stores FOR SELECT USING (is_approved = true);

-- Profiles: users can read/update their own
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Subscriptions: users can read their own
CREATE POLICY "Users can read own subscriptions"
  ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Service role has full access (for imports, admin)
-- This is handled by using supabaseAdmin with service_role key
