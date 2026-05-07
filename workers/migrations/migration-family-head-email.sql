-- Add an email column for family-head invite delivery.
--
-- Why: SMS-based invite delivery via Hubtel/Twilio has been the only channel
-- to date. With phone-OTP being deprecated in favor of phone+PIN auth, and
-- with no SMS provider currently active in production, the approval-link
-- email becomes the primary delivery channel. The phone column stays — it's
-- still the family head's identity for payout — but email carries the link.
--
-- Idempotent guard: SQLite ALTER TABLE has no IF NOT EXISTS for ADD COLUMN.
-- The migration runner should treat "duplicate column name" errors as
-- success (matches the convention noted in migration-donation-rail.sql).
ALTER TABLE memorials ADD COLUMN family_head_email TEXT;

-- An index by email helps the (future) lookup-pending-invite-by-email flow
-- without scanning the whole memorials table.
CREATE INDEX IF NOT EXISTS idx_memorials_family_head_email
  ON memorials(family_head_email)
  WHERE family_head_email IS NOT NULL;
