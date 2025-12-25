-- ============================================================================
-- Migration: 008_admin_user_management
-- Description: Admin functions for user management
-- ============================================================================

-- ============================================================================
-- CHECK IF USER IS ADMIN
-- ============================================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT email = 'jonas@jonasinfocus.com'
    FROM auth.users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- ============================================================================
-- GET ALL USERS WITH ENTITLEMENTS (ADMIN ONLY)
-- ============================================================================
CREATE OR REPLACE FUNCTION get_all_users_with_entitlements()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  display_name TEXT,
  plan TEXT,
  status TEXT,
  trial_ends_at TIMESTAMPTZ,
  current_period_ends_at TIMESTAMPTZ,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  -- Check if caller is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin only';
  END IF;

  RETURN QUERY
  SELECT
    u.id AS user_id,
    u.email::TEXT,
    COALESCE(u.raw_user_meta_data->>'display_name', u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1))::TEXT AS display_name,
    COALESCE(ue.plan, 'none')::TEXT AS plan,
    COALESCE(ue.status, 'none')::TEXT AS status,
    ue.trial_ends_at,
    ue.current_period_ends_at,
    ue.stripe_subscription_id,
    u.created_at
  FROM auth.users u
  LEFT JOIN user_entitlements ue ON u.id = ue.user_id
  ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_all_users_with_entitlements() TO authenticated;

-- ============================================================================
-- ADMIN UPDATE USER PLAN
-- Allows admin to grant or revoke plans
-- ============================================================================
CREATE OR REPLACE FUNCTION admin_update_user_plan(
  target_user_id UUID,
  new_plan TEXT,
  new_status TEXT,
  duration_days INTEGER DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  result JSON;
  new_period_end TIMESTAMPTZ;
BEGIN
  -- Check if caller is admin
  IF NOT is_admin() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Access denied: Admin only'
    );
  END IF;

  -- Validate plan
  IF new_plan NOT IN ('none', 'pro', 'founding') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid plan. Must be: none, pro, or founding'
    );
  END IF;

  -- Validate status
  IF new_status NOT IN ('none', 'trialing', 'active', 'past_due', 'canceled', 'expired') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid status. Must be: none, trialing, active, past_due, canceled, or expired'
    );
  END IF;

  -- Calculate period end if duration specified
  IF duration_days IS NOT NULL AND duration_days > 0 THEN
    new_period_end := NOW() + (duration_days || ' days')::INTERVAL;
  ELSE
    new_period_end := NULL; -- Permanent/no expiry
  END IF;

  -- Upsert the entitlement
  INSERT INTO user_entitlements (
    user_id,
    plan,
    status,
    current_period_ends_at,
    trial_ends_at,
    updated_at
  )
  VALUES (
    target_user_id,
    new_plan,
    new_status,
    new_period_end,
    NULL, -- Clear trial when admin sets plan
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    plan = EXCLUDED.plan,
    status = EXCLUDED.status,
    current_period_ends_at = EXCLUDED.current_period_ends_at,
    trial_ends_at = EXCLUDED.trial_ends_at,
    updated_at = NOW();

  RETURN jsonb_build_object(
    'success', true,
    'message', 'User plan updated successfully',
    'plan', new_plan,
    'status', new_status,
    'period_ends_at', new_period_end
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION admin_update_user_plan(UUID, TEXT, TEXT, INTEGER) TO authenticated;

-- ============================================================================
-- ADMIN CANCEL USER SUBSCRIPTION
-- Sets user back to free tier
-- ============================================================================
CREATE OR REPLACE FUNCTION admin_cancel_user_plan(target_user_id UUID)
RETURNS JSON AS $$
BEGIN
  -- Check if caller is admin
  IF NOT is_admin() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Access denied: Admin only'
    );
  END IF;

  -- Update the entitlement to free
  INSERT INTO user_entitlements (
    user_id,
    plan,
    status,
    current_period_ends_at,
    trial_ends_at,
    stripe_subscription_id,
    updated_at
  )
  VALUES (
    target_user_id,
    'none',
    'none',
    NULL,
    NULL,
    NULL,
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    plan = 'none',
    status = 'none',
    current_period_ends_at = NULL,
    trial_ends_at = NULL,
    stripe_subscription_id = NULL,
    updated_at = NOW();

  RETURN jsonb_build_object(
    'success', true,
    'message', 'User plan canceled successfully'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION admin_cancel_user_plan(UUID) TO authenticated;
