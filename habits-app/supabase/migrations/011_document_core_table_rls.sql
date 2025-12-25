-- ============================================================================
-- Migration: 011_document_core_table_rls
-- Description: Document and verify RLS on habits and completions tables
-- Priority: P0 - SHIP BLOCKER (tenant isolation proof)
-- ============================================================================

-- ============================================================================
-- HABITS TABLE RLS
-- Ensures users can only access their own habits
-- ============================================================================

-- Ensure RLS is enabled
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate with documentation
DROP POLICY IF EXISTS "Users can read own habits" ON habits;
DROP POLICY IF EXISTS "Users can only insert own habits with active access" ON habits;
DROP POLICY IF EXISTS "Users can only update own habits with active access" ON habits;
DROP POLICY IF EXISTS "Users can delete own habits" ON habits;

-- SELECT: Users can only see their own habits
CREATE POLICY "Users can read own habits"
  ON habits FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- INSERT: Users can only create habits for themselves (with subscription check)
CREATE POLICY "Users can only insert own habits with active access"
  ON habits FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND has_subscription_access(auth.uid())
  );

-- UPDATE: Users can only update their own habits (with subscription check)
CREATE POLICY "Users can only update own habits with active access"
  ON habits FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND has_subscription_access(auth.uid())
  );

-- DELETE: Users can only delete their own habits
CREATE POLICY "Users can delete own habits"
  ON habits FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- COMPLETIONS TABLE RLS
-- Ensures users can only access their own completions
-- ============================================================================

-- Ensure RLS is enabled
ALTER TABLE completions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate with documentation
DROP POLICY IF EXISTS "Users can read own completions" ON completions;
DROP POLICY IF EXISTS "Users can only insert own completions with active access" ON completions;
DROP POLICY IF EXISTS "Users can update own completions" ON completions;
DROP POLICY IF EXISTS "Users can delete own completions" ON completions;

-- SELECT: Users can only see their own completions
CREATE POLICY "Users can read own completions"
  ON completions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- INSERT: Users can only create completions for themselves (with subscription check)
CREATE POLICY "Users can only insert own completions with active access"
  ON completions FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND has_subscription_access(auth.uid())
  );

-- UPDATE: Users can only update their own completions
CREATE POLICY "Users can update own completions"
  ON completions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can only delete their own completions
CREATE POLICY "Users can delete own completions"
  ON completions FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- PERFORMANCE INDEXES
-- Added for query optimization on common access patterns
-- ============================================================================

-- Index for fetching user's habits ordered by creation
CREATE INDEX IF NOT EXISTS idx_habits_user_created
  ON habits(user_id, created_at);

-- Index for fetching user's completions by date (most common query)
CREATE INDEX IF NOT EXISTS idx_completions_user_date
  ON completions(user_id, date DESC);

-- Index for fetching completions by habit (for streak calculation)
CREATE INDEX IF NOT EXISTS idx_completions_user_habit
  ON completions(user_id, habit_id);

-- Composite index for habit-specific date queries
CREATE INDEX IF NOT EXISTS idx_completions_habit_date
  ON completions(habit_id, date DESC);

-- ============================================================================
-- VERIFICATION QUERIES
-- Run these manually to verify RLS is working correctly
-- ============================================================================
--
-- 1. Verify RLS is enabled:
--    SELECT tablename, rowsecurity FROM pg_tables
--    WHERE tablename IN ('habits', 'completions');
--    Expected: Both should show rowsecurity = true
--
-- 2. Verify policies exist:
--    SELECT tablename, policyname, cmd FROM pg_policies
--    WHERE tablename IN ('habits', 'completions')
--    ORDER BY tablename, cmd;
--
-- 3. Test tenant isolation (as User A, should not see User B's data):
--    -- Login as User A
--    SELECT * FROM habits; -- Should only return User A's habits
--    SELECT * FROM completions; -- Should only return User A's completions
--
-- 4. Test subscription enforcement:
--    -- As expired trial user, should fail:
--    INSERT INTO habits (user_id, name) VALUES (auth.uid(), 'Test');
--    Expected: ERROR - policy violation (has_subscription_access returns false)
-- ============================================================================
