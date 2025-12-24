-- ============================================================================
-- Migration: 007_fix_billing_rls_policies
-- Description: Add missing INSERT and UPDATE policies for billing tables
--              This fixes 406 errors when creating entitlements during signup
-- ============================================================================

-- ============================================================================
-- BILLING_CUSTOMERS - Add INSERT and UPDATE policies
-- ============================================================================

-- Users can insert their own billing_customers record
CREATE POLICY "Users can insert own billing_customers"
  ON billing_customers FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own billing_customers record
CREATE POLICY "Users can update own billing_customers"
  ON billing_customers FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- USER_ENTITLEMENTS - Add INSERT and UPDATE policies
-- ============================================================================

-- Users can insert their own user_entitlements record
CREATE POLICY "Users can insert own user_entitlements"
  ON user_entitlements FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own user_entitlements record
CREATE POLICY "Users can update own user_entitlements"
  ON user_entitlements FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Note: Service role (via STRIPE_SECRET_KEY in Edge Functions) has unrestricted access
-- ============================================================================
