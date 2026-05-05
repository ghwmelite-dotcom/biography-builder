-- ============================================================
-- Migration: Subscription dunning columns
-- Date: 2026-05-04
-- ============================================================

ALTER TABLE subscriptions ADD COLUMN last_dunning_sent_at TEXT DEFAULT NULL;
ALTER TABLE subscriptions ADD COLUMN dunning_stage INTEGER DEFAULT 0;
-- 0 = not in dunning, 1 = day1 sent, 2 = day3 sent, 3 = day7 downgraded

CREATE INDEX IF NOT EXISTS idx_sub_dunning ON subscriptions(status, dunning_stage, last_dunning_sent_at);
