-- Migration 012: Revoke public access to claim_founding_slot RPC
-- P1-BILL-3: Fix founding slot race condition and security vulnerability
--
-- ISSUE: The claim_founding_slot RPC function was callable by any authenticated
-- user, allowing them to become a founding member without actually paying.
-- The webhook doesn't use this RPC - it directly updates user_entitlements and
-- founding_slots with service role privileges.
--
-- FIX: Revoke EXECUTE permission from authenticated users. Only service role
-- (used by webhook) can modify these tables directly.

-- Revoke execute permission from authenticated users
REVOKE EXECUTE ON FUNCTION claim_founding_slot(UUID) FROM authenticated;

-- Also remove the unused export from client-facing functions
-- The function still exists for potential admin use, but can't be called from client

-- Document: Founding member flow is now:
-- 1. User clicks "Get Founding Access" → create-founding-session Edge Function
-- 2. User pays on Stripe checkout ($149)
-- 3. Stripe sends checkout.session.completed webhook
-- 4. stripe-webhook Edge Function (with service_role) directly:
--    a) Upserts user_entitlements with plan='founding', status='active'
--    b) Updates founding_slots table (claims a slot)
-- 5. User's EntitlementContext receives realtime update → access granted

-- Verification query:
-- SELECT grantee, privilege_type
-- FROM information_schema.routine_privileges
-- WHERE routine_name = 'claim_founding_slot';
-- Expected: No row for 'authenticated' role
