-- ============================================================================
-- Migration: 016_allow_free_habit_tracking
-- Description:
-- 1) Ensure new signups always get a user_entitlements row (plan/status = none)
-- 2) Allow authenticated users to INSERT/UPDATE their own habits + completions
--    without requiring has_subscription_access() (free/beta habit tracking)
--
-- Motivation:
-- New free/beta users were hitting 403 on POST /rest/v1/habits due to RLS
-- policies requiring has_subscription_access(), while new users often have no
-- user_entitlements row and free users (plan=none) are not "subscribed".
-- ============================================================================

-- ============================================================================
-- 1) Ensure user_entitlements row exists for every new user
--    We extend the existing auth.users trigger function created in 001.
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Legacy profile row (existing behavior)
  INSERT INTO public.user_profiles (id, created_at, updated_at)
  VALUES (NEW.id, NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;

  -- New entitlement row (safe defaults)
  INSERT INTO public.user_entitlements (user_id, plan, status)
  VALUES (NEW.id, 'none', 'none')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backfill entitlements for any existing users missing a row
INSERT INTO public.user_entitlements (user_id, plan, status)
SELECT id, 'none', 'none'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_entitlements)
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================================
-- 2) RLS policy updates for core habit tracking tables
--    Allow authenticated users to write their own rows (tenant-scoped).
-- ============================================================================

-- HABITS: remove subscription enforcement on insert/update
DROP POLICY IF EXISTS "Users can only insert own habits with active access" ON habits;
DROP POLICY IF EXISTS "Users can only insert own habits" ON habits;

CREATE POLICY "Users can insert own habits"
  ON habits FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only update own habits with active access" ON habits;
DROP POLICY IF EXISTS "Users can only update own habits" ON habits;

CREATE POLICY "Users can update own habits"
  ON habits FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- COMPLETIONS: remove subscription enforcement on insert
DROP POLICY IF EXISTS "Users can only insert own completions with active access" ON completions;
DROP POLICY IF EXISTS "Users can only insert own completions" ON completions;

CREATE POLICY "Users can insert own completions"
  ON completions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);


