# Phone + PIN + Email-Recovery Auth — Design Spec

**Status:** Draft, awaiting user input on open questions before implementation.
**Author:** 2026-05-07
**Replaces:** `/auth/phone/{send-otp, verify, link, unlink}` (Hubtel-dependent OTP flow, deprecated 2026-05-07).
**Coexists with:** Google OAuth (`/auth/google`), unchanged.

---

## 1. Goals

1. **Hubtel-free authentication** — no SMS provider in any flow.
2. **Familiar to Ghana market** — phone-as-username + PIN-as-password matches MoMo apps.
3. **Self-service PIN recovery** via email link.
4. **Family heads can log into the dashboard** without depending on the SMS infrastructure that's been blocked since launch.
5. **Existing Google users keep working** unchanged.

## 2. Non-goals

- Multi-factor (TOTP, hardware keys) — future PR.
- Magic-link / passwordless login — future PR.
- Letting Google users add a phone+PIN as a fallback — future PR.
- Phone-number change — out of scope, handled via support ticket.
- Self-account-deletion — out of scope.
- Variable PIN lengths — fixed length per the open questions below.

---

## 3. User flows

### 3.1 Sign up
```
1. User taps "Continue with phone" on SignInChooser
2. Form fields:
     - phone (E.164, normalized server-side)
     - email (must be unique across users)
     - PIN (4 digits, numeric only — revised 2026-05-08 to match MTN MoMo / Vodafone Cash UX in Ghana)
     - confirm PIN
     - name
3. POST /auth/phone/signup
4. Backend:
     a. Rate-limit check (5 signups/IP/hr)
     b. Validate inputs
     c. Reject if phone OR email already exists (409)
     d. Hash PIN via PBKDF2 (600k iterations, SHA-256, 16-byte random salt)
     e. Insert users row: phone_e164, email, pin_hash, name, auth_methods='phone'
     f. Generate email-verification token (random 32-byte hex), hash + store in auth_email_tokens, 24h TTL
     g. Send Resend email with link: https://funeralpress.org/auth/verify-email?token=...
5. Response: 201 { userId, message: "Check your email to verify your account" }
6. User can log in immediately, but a banner urges email verification
```

### 3.2 Login
```
1. User taps "Continue with phone" on SignInChooser
2. Form: phone + PIN
3. POST /auth/phone/login
4. Backend:
     a. Rate-limit check (5/phone/15min, 20/IP/hr)
     b. Lookup user by phone_e164
     c. If user.pin_lockout_until > now: 423 Locked, return retry-after
     d. Verify PIN via PBKDF2.compare
     e. On wrong PIN: increment pin_failed_attempts. If ≥5, set lockout_until = now+1h. Return 401.
     f. On success: reset pin_failed_attempts=0, clear lockout_until, issue access JWT (15min) + refresh token (30 days, opaque hex hashed in DB)
5. Response: 200 { accessToken, refreshToken, user: { id, name, email, phone, email_verified } }
```

### 3.3 Forgot PIN
```
1. User taps "Forgot PIN?" link on phone-PIN login dialog
2. Form: phone
3. POST /auth/phone/forgot
4. Backend (always returns 202 to prevent enumeration):
     a. Rate-limit (3/phone/hr, 10/IP/hr)
     b. Lookup user by phone_e164
     c. If found AND email_verified_at is set:
          - Generate reset token (random 32-byte hex), hash + store in auth_email_tokens with purpose='pin_reset', 30min TTL
          - Send Resend email with link: https://funeralpress.org/auth/reset-pin?token=...
     d. If not found OR email not verified: silently do nothing (still 202)
5. Response: 202 { message: "If an account matches, a reset link is on its way" }
```

### 3.4 Reset PIN (from email link)
```
1. User clicks reset link in email
2. SPA route /auth/reset-pin reads token from URL
3. Form: new PIN + confirm new PIN
4. POST /auth/phone/reset { token, new_pin }
5. Backend:
     a. Rate-limit (5/IP/hr)
     b. Lookup auth_email_tokens by token_hash, purpose='pin_reset'
     c. Reject if expired, consumed, or missing (401)
     d. Validate new_pin format
     e. Hash new PIN via PBKDF2
     f. Atomic update: pin_hash, pin_set_at=now, pin_failed_attempts=0, pin_lockout_until=NULL on users
     g. Mark token consumed_at=now
     h. Invalidate all existing refresh tokens for this user (force re-login on other devices)
     i. Send "Your PIN was changed" notification email (security audit trail)
6. Response: 200 { message: "PIN reset. Log in with your new PIN." }
```

### 3.5 Verify email (from signup link)
```
1. User clicks verification link
2. SPA route /auth/verify-email reads token from URL
3. POST /auth/phone/verify-email { token }
4. Backend:
     a. Lookup auth_email_tokens by token_hash, purpose='email_verify'
     b. Reject if expired, consumed, or missing (401)
     c. Update users.email_verified_at = now
     d. Mark token consumed_at = now
5. Response: 200 { message: "Email verified" }
6. SPA shows success + auto-login if a session exists
```

### 3.6 Change PIN (authenticated)
```
1. User in account settings → "Change PIN"
2. Form: current PIN + new PIN + confirm new PIN
3. POST /auth/phone/change-pin { current_pin, new_pin } (Bearer JWT required)
4. Backend:
     a. Verify current_pin against pin_hash (treat wrong as silent rate-limit hit too)
     b. Hash new_pin
     c. Update pin_hash, pin_set_at=now
     d. Send "Your PIN was changed" notification email
5. Response: 200
```

---

## 4. Schema additions

**ALTER TABLE users:**
```sql
ALTER TABLE users ADD COLUMN pin_hash TEXT;
ALTER TABLE users ADD COLUMN pin_set_at INTEGER;
ALTER TABLE users ADD COLUMN pin_failed_attempts INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN pin_lockout_until INTEGER;
ALTER TABLE users ADD COLUMN email_verified_at INTEGER;
```

(`email_verified_at` will be backfilled to `created_at` for existing Google users, since Google's verified email is trustworthy.)

**New table auth_email_tokens:**
```sql
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
```

**Migration cleanup (one-time):**
```sql
-- Existing Google users: trust Google's email verification
UPDATE users SET email_verified_at = created_at
  WHERE email_verified_at IS NULL
    AND auth_methods = 'google';

-- Existing phone-only synthesized users (from the deprecated approval flow):
-- delete because they have no real email and no PIN. Family heads will sign
-- up cleanly via the new flow. (Their family-head approval link still works
-- regardless — the donation flow doesn't depend on user records.)
DELETE FROM users
  WHERE auth_methods = 'phone'
    AND email LIKE 'phone-%@phone.funeralpress.org';
```

---

## 5. API surface (auth-api worker)

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/auth/phone/signup` | none | `{ phone, email, pin, name }` | 201 `{ userId }` |
| POST | `/auth/phone/login` | none | `{ phone, pin }` | 200 `{ accessToken, refreshToken, user }` or 401/423 |
| POST | `/auth/phone/forgot` | none | `{ phone }` | 202 always (enumeration-safe) |
| POST | `/auth/phone/reset` | none | `{ token, new_pin }` | 200 `{}` or 401 |
| POST | `/auth/phone/verify-email` | none | `{ token }` | 200 `{}` or 401 |
| POST | `/auth/phone/change-pin` | Bearer | `{ current_pin, new_pin }` | 200 `{}` or 401 |

All routes go through the existing `getRouteGroup` rate-limit dispatch. The `auth` route group (10/min/IP) covers everything; finer per-phone limits live in the handler.

---

## 6. Security

| Concern | Mitigation |
|---|---|
| Brute-force PIN | Per-user lockout after 5 wrong attempts (1h auto-unlock); per-phone rate-limit 5/15min |
| Phone enumeration | Forgot returns 202 always; login error message is generic ("Wrong phone or PIN") |
| Reset link interception | 30min TTL; one-time use; sent only to verified email |
| Verification link interception | 24h TTL; one-time use; the link itself confirms ownership |
| PIN at rest | PBKDF2-SHA256 600k iterations, 16-byte random salt, format-versioned (`pbkdf2$600000$...`) so iteration count can be raised later |
| Stolen access token | 15-minute TTL; refresh token in HTTPS-only secure cookie (or hashed DB row, opaque) |
| Stolen refresh token | Refresh tokens are single-use rotated; reset-PIN invalidates all of them |
| Replay of consumed link | `consumed_at` set atomically with the action |
| PIN reuse across services | Notification email after every change |
| User panicking after a forgotten PIN | Clear copy in UI; success message says "log in with your new PIN" |

PBKDF2 (not Argon2/scrypt) chosen because Web Crypto exposes it natively in Workers — no WASM bundle. 600k iterations is ~150ms on a Worker, well within p99 budget for login.

---

## 7. Frontend components (SPA)

| Component | Path | Notes |
|---|---|---|
| `PhonePinSignupDialog` | invoked from SignInChooser | Phone (with country picker, default GH +233) + email + PIN + confirm PIN + name |
| `PhonePinLoginDialog` | invoked from SignInChooser | Phone + PIN, "Forgot PIN?" link |
| `ForgotPinDialog` | invoked from PhonePinLoginDialog | Phone input only; success copy is "Check your email" |
| `ResetPinPage` | route `/auth/reset-pin` | Reads `?token=` from URL, new+confirm PIN form |
| `VerifyEmailPage` | route `/auth/verify-email` | Reads `?token=`, calls verify endpoint, shows success/error |
| `ChangePinSection` | account settings page | Three-PIN form (current, new, confirm) |
| `EmailVerificationBanner` | top of authed pages | Shows when `user.email_verified_at == null`. Has "Resend verification email" button |
| `SignInChooser` (update) | existing | Add a "Continue with phone" tile beside Google. Drop the `VITE_PHONE_AUTH_ENABLED` flag |
| `PinInput` | shared | 4-digit input matching the existing OtpCodeInput style for visual consistency |

---

## 8. Migration plan

1. Run schema migration on remote D1: ALTER TABLE users + CREATE auth_email_tokens.
2. Backfill `email_verified_at` for existing Google users (trust Google).
3. Delete synthesized phone-only users (created by the deprecated approval flow — they have no PIN and a fake email).
4. Deploy backend code (auth-api with new routes).
5. Deploy frontend (new dialogs, pages, SignInChooser update).
6. **Don't** delete the old `/auth/phone/{send-otp,verify,link,unlink}` routes yet — leave them for one deploy as 410 Gone responders, then remove in PR 3.

---

## 9. Implementation order (within PR 2)

1. Backend utility: `workers/utils/pinHash.js` — `hashPin`, `verifyPin`, format-versioned PBKDF2.
2. Backend utility: `workers/utils/authEmailToken.js` — token generation, hashing, lookup, consume.
3. Backend utility: `workers/utils/authEmails.js` — Resend-based templates for verify, reset, pin-changed.
4. Schema migration: `workers/migrations/migration-phone-pin-auth.sql`.
5. Backend routes (one PR section, six handlers + tests).
6. Frontend `PinInput` (shared base).
7. Frontend dialogs in order: signup, login, forgot, reset, verify-email.
8. Frontend `ChangePinSection` + `EmailVerificationBanner`.
9. Update `SignInChooser` to add the phone tile and drop the flag gate.
10. End-to-end tests covering signup → email verify → login → forgot → reset → login.
11. Deploy + apply migration + smoke-test.

---

## 10. Test plan

- Unit tests: `pinHash` (round-trip, wrong PIN, format-versioning), `authEmailToken` (generate/verify/consume).
- Handler tests per route: happy path, validation errors, rate-limit, lockout, replay rejection.
- Integration: signup → verify email → login → forgot → reset → login (mocked Resend).
- Frontend component tests: dialog flow, form validation, error surfacing.
- Manual smoke test post-deploy: real signup with a real Resend email.

---

## 11. Open questions (need user input before coding)

1. **PIN length** — ~~6 digits exact~~ → **revised 2026-05-08 to 4 digits exact** to match MTN MoMo / Vodafone Cash. Brute-force resistance comes from the 5-attempt lockout, not from PIN entropy.
2. **Country allowlist** — Ghana only (+233), or open E.164? (My pick: **open E.164**, since Ghanaians abroad and family members in diaspora exist.)
3. **Email verification gate** — block login until verified, or just gate PIN reset? (My pick: **gate PIN reset only**. Login works pre-verification with a banner. Less friction, security risk is bounded because PIN reset requires email anyway.)
4. **Lockout duration** — 1h auto-unlock, 24h, or admin-only unlock? (My pick: **1h auto-unlock**. Real users forget PINs.)
5. **Should phone-only synthesized users be deleted at migration?** (My pick: **yes**, they're unreachable today and family-head approval doesn't depend on the user row.)
6. **Should successful login reset `pin_failed_attempts` even if the count is non-zero?** (My pick: **yes**, reset on every success.)
7. **Refresh-token storage** — opaque hex in DB (current Google flow) or short-lived JWT? (My pick: **opaque hex in DB**, matches existing Google refresh flow + supports invalidation on reset-PIN.)
8. **Resend email sender domain** — `notifications@funeralpress.org` (current) or a separate `auth@funeralpress.org` for cleaner inbox segmentation? (My pick: **`notifications@funeralpress.org`** for now, segment later if needed.)

If you don't have strong opinions, agreeing with all my picks gets us going immediately.
