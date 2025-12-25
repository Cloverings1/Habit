-- ============================================================================
-- Migration: 009_remove_user_update_policies
-- Description: SECURITY FIX - Remove UPDATE policies that allow users to
--              self-upgrade their billing/entitlement status
-- Priority: P0 - SHIP BLOCKER
-- ============================================================================

-- ============================================================================
-- REMOVE DANGEROUS UPDATE POLICIES
-- These policies were added in migration 007 to fix 406 errors during signup,
-- but they allow any authenticated user to UPDATE their own entitlements,
-- effectively bypassing the payment system entirely.
-- ============================================================================

-- Remove user UPDATE policy on user_entitlements
-- This policy allowed: UPDATE user_entitlements SET plan='founding', status='active'
DROP POLICY IF EXISTS "Users can update own user_entitlements" ON user_entitlements;

-- Remove user UPDATE policy on billing_customers
-- This policy allowed users to change their stripe_customer_id
DROP POLICY IF EXISTS "Users can update own billing_customers" ON billing_customers;

-- ============================================================================
-- VERIFICATION QUERIES (run manually to confirm)
-- ============================================================================
-- After applying this migration, verify with:
--
-- 1. Check no UPDATE policies exist for users on these tables:
--    SELECT policyname, cmd FROM pg_policies
--    WHERE tablename IN ('user_entitlements', 'billing_customers')
--    AND cmd = 'UPDATE';
--
-- 2. Attempt UPDATE as authenticated user (should fail):
--    UPDATE user_entitlements SET plan = 'pro' WHERE user_id = auth.uid();
--    Expected: ERROR - policy violation
-- ============================================================================

-- ============================================================================
-- NOTE: INSERT policies are retained because:
-- 1. user_entitlements INSERT: Needed for initial row creation during signup
--    (sets plan='none', status='none' - safe defaults)
-- 2. billing_customers INSERT: Needed to link Stripe customer ID during checkout
--
-- ONLY the service role (via Edge Functions/webhooks) should UPDATE these tables.
-- ============================================================================
