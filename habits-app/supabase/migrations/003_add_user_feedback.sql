-- ============================================================================
-- Migration: 003_add_user_feedback
-- Description: Add user feedback table for quiet, minimal feedback system
-- ============================================================================

-- ============================================================================
-- USER FEEDBACK TABLE
-- Stores user feedback and bug reports
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('feedback', 'bug')),
  priority TEXT NOT NULL CHECK (priority IN ('fyi', 'minor', 'important', 'critical')),
  message TEXT NOT NULL,
  app_version TEXT,
  platform TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  internal_notes TEXT
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Index for sorting by creation date (newest first)
CREATE INDEX IF NOT EXISTS idx_user_feedback_created_at
  ON user_feedback(created_at DESC);

-- Index for filtering by type
CREATE INDEX IF NOT EXISTS idx_user_feedback_type
  ON user_feedback(type);

-- Index for filtering by priority
CREATE INDEX IF NOT EXISTS idx_user_feedback_priority
  ON user_feedback(priority);

-- Index for filtering resolved vs unresolved
CREATE INDEX IF NOT EXISTS idx_user_feedback_resolved_at
  ON user_feedback(resolved_at);

-- Composite index for common admin queries
CREATE INDEX IF NOT EXISTS idx_user_feedback_admin_query
  ON user_feedback(created_at DESC, type, priority, resolved_at);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on user_feedback
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- Users can INSERT their own feedback (but cannot read, update, or delete)
CREATE POLICY "Users can insert own feedback"
  ON user_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admin (founder) can read all feedback
-- Using email check for server-side enforcement
CREATE POLICY "Admin can read all feedback"
  ON user_feedback
  FOR SELECT
  TO authenticated
  USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'jonas@jonasinfocus.com'
  );

-- Admin (founder) can update feedback (for internal notes and resolved_at)
CREATE POLICY "Admin can update all feedback"
  ON user_feedback
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'jonas@jonasinfocus.com'
  )
  WITH CHECK (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'jonas@jonasinfocus.com'
  );

-- No delete policy - feedback cannot be deleted from UI

-- ============================================================================
-- HELPER FUNCTION: Check if current user is admin
-- ============================================================================
CREATE OR REPLACE FUNCTION is_feedback_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT email = 'jonas@jonasinfocus.com'
    FROM auth.users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION is_feedback_admin() TO authenticated;
