-- ============================================================================
-- Migration: 010_webhook_idempotency
-- Description: Add idempotency tracking for Stripe webhook events
-- Priority: P0 - SHIP BLOCKER
-- ============================================================================

-- ============================================================================
-- PROCESSED WEBHOOK EVENTS TABLE
-- Tracks which Stripe webhook events have been processed to prevent
-- duplicate processing on retries.
-- ============================================================================

CREATE TABLE IF NOT EXISTS processed_webhook_events (
  id TEXT PRIMARY KEY,                    -- Stripe event ID (evt_xxx)
  event_type TEXT NOT NULL,               -- e.g., 'checkout.session.completed'
  processed_at TIMESTAMPTZ DEFAULT NOW(), -- When we processed it
  idempotency_key TEXT,                   -- Optional: for additional deduplication
  metadata JSONB DEFAULT '{}'             -- Store event summary for debugging
);

-- Index for cleanup queries (delete events older than 30 days)
CREATE INDEX IF NOT EXISTS idx_processed_webhook_events_processed_at
  ON processed_webhook_events(processed_at);

-- Index for event type analysis
CREATE INDEX IF NOT EXISTS idx_processed_webhook_events_type
  ON processed_webhook_events(event_type);

-- ============================================================================
-- NO RLS NEEDED
-- This table is only accessed by Edge Functions using service_role key.
-- Authenticated users should never interact with this table.
-- ============================================================================

-- Explicitly disable RLS (service role only)
ALTER TABLE processed_webhook_events ENABLE ROW LEVEL SECURITY;

-- No policies = only service_role can access
-- This is intentional and correct.

-- ============================================================================
-- CLEANUP FUNCTION
-- Call periodically to remove old events (e.g., via pg_cron)
-- ============================================================================

CREATE OR REPLACE FUNCTION cleanup_old_webhook_events()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM processed_webhook_events
  WHERE processed_at < NOW() - INTERVAL '30 days';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- HELPER FUNCTION: Check if event already processed
-- Returns TRUE if event should be skipped (already processed)
-- ============================================================================

CREATE OR REPLACE FUNCTION is_webhook_event_processed(event_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM processed_webhook_events WHERE id = event_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- HELPER FUNCTION: Mark event as processed
-- Returns TRUE if successfully marked (first time), FALSE if duplicate
-- ============================================================================

CREATE OR REPLACE FUNCTION mark_webhook_event_processed(
  event_id TEXT,
  event_type_param TEXT,
  event_metadata JSONB DEFAULT '{}'
)
RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO processed_webhook_events (id, event_type, metadata)
  VALUES (event_id, event_type_param, event_metadata)
  ON CONFLICT (id) DO NOTHING;

  -- Return TRUE if we inserted (first time), FALSE if conflict (duplicate)
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION cleanup_old_webhook_events() TO service_role;
GRANT EXECUTE ON FUNCTION is_webhook_event_processed(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION mark_webhook_event_processed(TEXT, TEXT, JSONB) TO service_role;
