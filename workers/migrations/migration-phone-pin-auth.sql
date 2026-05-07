-- Phone + PIN + email-recovery auth scaffolding.
-- See docs/superpowers/specs/2026-05-07-phone-pin-auth-design.md.
--
-- Idempotent guard: SQLite has no IF NOT EXISTS for ADD COLUMN. The migration
-- runner should treat duplicate-column errors as success (matches the
-- convention used in migration-donation-rail.sql:147+).

-- 1) New users columns for the phone+PIN flow.
ALTER TABLE users ADD COLUMN pin_hash TEXT;                                -- format-versioned: pbkdf2$<iter>$<salt_b64>$<hash_b64>
ALTER TABLE users ADD COLUMN pin_set_at INTEGER;                           -- ms epoch
ALTER TABLE users ADD COLUMN pin_failed_attempts INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN pin_lockout_until INTEGER;                    -- ms epoch; null when not locked
ALTER TABLE users ADD COLUMN email_verified_at INTEGER;                    -- ms epoch

-- 2) Email-token table for both signup verification and PIN reset.
CREATE TABLE IF NOT EXISTS auth_email_tokens (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     TEXT NOT NULL REFERENCES users(id),
  token_hash  TEXT NOT NULL UNIQUE,
  purpose     TEXT NOT NULL CHECK (purpose IN ('email_verify', 'pin_reset')),
  created_at  INTEGER NOT NULL,
  expires_at  INTEGER NOT NULL,
  consumed_at INTEGER,
  ip_address  TEXT
);

CREATE INDEX IF NOT EXISTS idx_auth_email_tokens_user
  ON auth_email_tokens(user_id, purpose, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_auth_email_tokens_unconsumed
  ON auth_email_tokens(expires_at) WHERE consumed_at IS NULL;

-- 3) Backfill: trust Google's email verification for existing Google users.
-- Their email is verified by Google as part of the OAuth flow, so it's safe
-- to mark verified at created_at.
UPDATE users
   SET email_verified_at = created_at
 WHERE email_verified_at IS NULL
   AND auth_methods = 'google';

-- 4) Cleanup: remove synthesized phone-only users created by the deprecated
-- approval flow. They have no PIN and a fake email of the form
-- 'phone-<phone>@phone.funeralpress.org'. Family-head approval doesn't
-- depend on the users row, so this is safe — existing approval links
-- continue to work and any new signups via the phone+PIN flow get a clean
-- account with their real email.
DELETE FROM users
 WHERE auth_methods = 'phone'
   AND email LIKE 'phone-%@phone.funeralpress.org';
