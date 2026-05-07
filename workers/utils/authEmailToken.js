// Email-token helpers for the phone+PIN auth flow.
//
// One table (auth_email_tokens) holds tokens for two purposes:
//   - 'email_verify' — link sent at signup, 24h TTL
//   - 'pin_reset'    — link sent on Forgot PIN, 30m TTL
//
// The raw 32-byte hex token goes in the email link the user clicks. Only the
// sha256 hash is stored in DB so a DB compromise can't replay the link.
// Consumption is idempotent: the same token cannot be redeemed twice.

const RAW_TOKEN_BYTES = 32
const VALID_PURPOSES = new Set(['email_verify', 'pin_reset'])

export const EMAIL_VERIFY_TTL_MS = 24 * 60 * 60 * 1000  // 24h
export const PIN_RESET_TTL_MS = 30 * 60 * 1000          // 30m

function ttlFor(purpose) {
  if (purpose === 'email_verify') return EMAIL_VERIFY_TTL_MS
  if (purpose === 'pin_reset') return PIN_RESET_TTL_MS
  throw new Error(`Unknown auth-email-token purpose: ${purpose}`)
}

function bytesToHex(bytes) {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function sha256Hex(input) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
  return bytesToHex(new Uint8Array(buf))
}

/**
 * Generate a fresh token for a user + purpose, persist its hash in
 * auth_email_tokens with the appropriate TTL, and return the raw token to
 * embed in the email link.
 *
 * Returns { token, expiresAt } — the caller is responsible for actually
 * sending the email; failure of the send doesn't invalidate the row.
 */
export async function generateAuthEmailToken(db, { userId, purpose, ipAddress = null }) {
  if (!VALID_PURPOSES.has(purpose)) {
    throw new Error(`Unknown auth-email-token purpose: ${purpose}`)
  }
  const raw = crypto.getRandomValues(new Uint8Array(RAW_TOKEN_BYTES))
  const token = bytesToHex(raw)
  const tokenHash = await sha256Hex(token)
  const now = Date.now()
  const expiresAt = now + ttlFor(purpose)
  await db.prepare(
    `INSERT INTO auth_email_tokens
       (user_id, token_hash, purpose, created_at, expires_at, ip_address)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(userId, tokenHash, purpose, now, expiresAt, ipAddress).run()
  return { token, expiresAt }
}

/**
 * Atomically validate and consume a token. Returns
 *   { ok: true, userId }            on success
 *   { ok: false, reason: 'not_found' | 'expired' | 'already_consumed' | 'malformed' }
 * on failure. Caller should not leak `reason` to the client — generic
 * "invalid or expired link" copy is enough.
 */
export async function consumeAuthEmailToken(db, { token, purpose }) {
  if (typeof token !== 'string' || token.length !== RAW_TOKEN_BYTES * 2 || !/^[0-9a-f]+$/.test(token)) {
    return { ok: false, reason: 'malformed' }
  }
  if (!VALID_PURPOSES.has(purpose)) {
    return { ok: false, reason: 'malformed' }
  }
  const tokenHash = await sha256Hex(token)
  const row = await db.prepare(
    `SELECT id, user_id, expires_at, consumed_at
       FROM auth_email_tokens
      WHERE token_hash = ? AND purpose = ?`
  ).bind(tokenHash, purpose).first()
  if (!row) return { ok: false, reason: 'not_found' }
  if (row.consumed_at != null) return { ok: false, reason: 'already_consumed' }
  if (row.expires_at < Date.now()) return { ok: false, reason: 'expired' }
  // Atomic consume: only flip consumed_at if it's still null. The result
  // tells us whether *we* won the race against another concurrent click.
  const upd = await db.prepare(
    `UPDATE auth_email_tokens
        SET consumed_at = ?
      WHERE id = ? AND consumed_at IS NULL`
  ).bind(Date.now(), row.id).run()
  if ((upd?.meta?.changes ?? 0) !== 1) return { ok: false, reason: 'already_consumed' }
  return { ok: true, userId: row.user_id }
}
