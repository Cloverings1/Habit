-- ============================================================================
-- Migration: 013_fix_access_function_and_insert_policy
-- Description: CRITICAL P0 FIXES from System Failure Prevention Audit
-- Priority: P0 - SHIP BLOCKER
-- Date: 2025-12-24
-- ============================================================================

-- ============================================================================
-- P0-FIX-1: Update has_subscription_access() to read from user_entitlements
--
-- ISSUE: The function in migration 004 reads from the legacy `user_profiles`
-- table, but the new billing system (webhooks) writes to `user_entitlements`.
-- This creates a split-brain scenario where trial enforcement can fail.
--
-- FIX: Rewrite to read from `user_entitlements` instead.
-- ============================================================================

CREATE OR REPLACE FUNCTION has_subscription_access(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_plan TEXT;
  user_status TEXT;
  trial_end TIMESTAMPTZ;
  period_end TIMESTAMPTZ;
BEGIN
  -- Read from user_entitlements (new billing system)
  SELECT plan, status, trial_ends_at, current_period_ends_at
  INTO user_plan, user_status, trial_end, period_end
  FROM user_entitlements
  WHERE user_id = user_uuid;

  -- No entitlement record = no access
  IF user_plan IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Founding members always have access (lifetime)
  IF user_plan = 'founding' AND user_status = 'active' THEN
    RETURN TRUE;
  END IF;

  -- Pro users with active subscription have access if within period
  IF user_plan = 'pro' AND user_status = 'active' THEN
    RETURN period_end IS NULL OR period_end > NOW();
  END IF;

  -- Pro users trialing have access if trial hasn't expired
  IF user_plan = 'pro' AND user_status = 'trialing' THEN
    RETURN trial_end IS NOT NULL AND trial_end > NOW();
  END IF;

  -- All other cases: no access
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Also update is_trial_expired() to read from user_entitlements
-- ============================================================================

CREATE OR REPLACE FUNCTION is_trial_expired(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_status TEXT;
  trial_end TIMESTAMPTZ;
BEGIN
  SELECT status, trial_ends_at
  INTO user_status, trial_end
  FROM user_entitlements
  WHERE user_id = user_uuid;

  -- If no record or no trial, not expired
  IF user_status IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check if trialing and trial has ended
  IF user_status = 'trialing' AND trial_end IS NOT NULL AND trial_end < NOW() THEN
    RETURN TRUE;
  END IF;

  -- Check if status indicates expired trial (canceled/expired after trial)
  IF user_status IN ('canceled', 'expired') THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- P0-FIX-2: Constrain user_entitlements INSERT policy
--
-- ISSUE: The INSERT policy in migration 007 allows users to insert rows with
-- ANY plan/status values. This is a privilege escalation vector where a user
-- could execute:
--   INSERT INTO user_entitlements (user_id, plan, status)
--   VALUES (auth.uid(), 'founding', 'active');
--
-- FIX: Drop the permissive policy and recreate with constraint that only
-- allows inserting with plan='none' and status='none'. The webhook (using
-- service role) handles all legitimate plan/status changes.
-- ============================================================================

-- Drop the existing permissive INSERT policy
DROP POLICY IF EXISTS "Users can insert own user_entitlements" ON user_entitlements;

-- Recreate with strict constraints
-- Users can only INSERT a row for themselves with safe defaults
CREATE POLICY "Users can insert own user_entitlements"
  ON user_entitlements FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND plan = 'none'
    AND status = 'none'
  );

-- ============================================================================
-- VERIFICATION QUERIES (run manually to confirm)
-- ============================================================================
--
-- 1. Verify has_subscription_access reads from user_entitlements:
--    SELECT prosrc FROM pg_proc WHERE proname = 'has_subscription_access';
--    Should reference user_entitlements, NOT user_profiles
--
-- 2. Verify INSERT policy has constraints:
--    SELECT polname, polqual::text, polwithcheck::text
--    FROM pg_policy
--    WHERE polrelid = 'user_entitlements'::regclass
--    AND polcmd = 'a';  -- 'a' = INSERT
--    Should show plan = 'none' AND status = 'none' in WITH CHECK
--
-- 3. Test privilege escalation is blocked:
--    -- As authenticated user, this should FAIL:
--    INSERT INTO user_entitlements (user_id, plan, status)
--    VALUES (auth.uid(), 'founding', 'active');
--    -- Expected: ERROR - policy violation
--
-- 4. Test legitimate insert works:
--    -- As authenticated user, this should SUCCEED:
--    INSERT INTO user_entitlements (user_id, plan, status)
--    VALUES (auth.uid(), 'none', 'none');
--    -- Expected: SUCCESS
-- ============================================================================
