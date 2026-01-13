-- =============================================================================
-- Slice 4: Store Submissions (Untrusted, Isolated from Directory)
-- =============================================================================
--
-- Inbound submissions ONLY. NOT directory listings.
-- Explicitly NO foreign keys to directory tables.
-- Explicitly NO triggers or functions.
--

CREATE TABLE IF NOT EXISTS store_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  business_name TEXT NOT NULL,
  street_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,

  phone TEXT,
  website TEXT,

  status TEXT NOT NULL DEFAULT 'pending',

  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Explicitly NO foreign keys
-- Explicitly NO triggers
-- Explicitly NO indexes beyond primary key
