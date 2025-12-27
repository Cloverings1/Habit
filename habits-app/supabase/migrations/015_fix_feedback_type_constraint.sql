-- ============================================================================
-- Migration: 015_fix_feedback_type_constraint
-- Description: Allow 'feature' as a valid user_feedback.type
-- ============================================================================

-- Drop existing constraint (name may vary by environment; this is the default)
ALTER TABLE user_feedback
  DROP CONSTRAINT IF EXISTS user_feedback_type_check;

-- Add updated constraint with 'feature' included
ALTER TABLE user_feedback
  ADD CONSTRAINT user_feedback_type_check
  CHECK (type IN ('feedback', 'bug', 'feature'));


