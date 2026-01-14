-- Auto Profile Creation on Signup
-- Migration: 0008_auto_profile_creation
-- Created: 2026-01-14
--
-- Creates a database trigger that automatically creates a profile record
-- when a new user signs up through Supabase Auth.

-- =============================================================================
-- Function: Create profile for new user
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, is_store_owner, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    FALSE,
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- Trigger: Run after user is created in auth.users
-- =============================================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- RLS Policy: Allow users to insert their own profile (fallback)
-- =============================================================================

-- In case the trigger fails, allow users to insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =============================================================================
-- Comments
-- =============================================================================

COMMENT ON FUNCTION public.handle_new_user() IS
  'Automatically creates a profile record when a new user signs up';

COMMENT ON TRIGGER on_auth_user_created ON auth.users IS
  'Triggers profile creation after user signup';
