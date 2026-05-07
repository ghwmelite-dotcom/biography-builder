import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  generateAuthEmailToken,
  consumeAuthEmailToken,
  EMAIL_VERIFY_TTL_MS,
  PIN_RESET_TTL_MS,
} from '../utils/authEmailToken.js'

function makeMockDb() {
  const rows = []
  return {
    _rows: rows,
    prepare: (sql) => ({
      bind: (...args) => ({
        run: async () => {
          if (sql.includes('INSERT INTO auth_email_tokens')) {
            rows.push({
              id: rows.length + 1,
              user_id: args[0],
              token_hash: args[1],
              purpose: args[2],
              created_at: args[3],
              expires_at: args[4],
              consumed_at: null,
              ip_address: args[5] ?? null,
            })
            return { meta: { last_row_id: rows.length, changes: 1 } }
          }
          if (sql.includes('UPDATE auth_email_tokens') && sql.includes('consumed_at')) {
            const r = rows.find((x) => x.id === args[1])
            if (r && r.consumed_at == null) {
              r.consumed_at = args[0]
              return { meta: { changes: 1 } }
            }
            return { meta: { changes: 0 } }
          }
          return { meta: { changes: 0 } }
        },
        first: async () => {
          if (sql.includes('FROM auth_email_tokens') && sql.includes('token_hash')) {
            const r = rows.find((x) => x.token_hash === args[0] && x.purpose === args[1])
            return r || null
          }
          return null
        },
      }),
    }),
  }
}

describe('generateAuthEmailToken', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-07T12:00:00Z'))
  })

  it('produces a 64-hex-char token (32 bytes)', async () => {
    const db = makeMockDb()
    const { token } = await generateAuthEmailToken(db, {
      userId: 'u1', purpose: 'email_verify',
    })
    expect(token).toMatch(/^[0-9a-f]{64}$/)
  })

  it('inserts a row with the token hash (NOT the raw token) + correct expiry for email_verify (24h)', async () => {
    const db = makeMockDb()
    await generateAuthEmailToken(db, {
      userId: 'u1', purpose: 'email_verify', ipAddress: '1.2.3.4',
    })
    expect(db._rows).toHaveLength(1)
    const row = db._rows[0]
    expect(row.user_id).toBe('u1')
    expect(row.purpose).toBe('email_verify')
    expect(row.token_hash).toMatch(/^[0-9a-f]{64}$/)
    expect(row.ip_address).toBe('1.2.3.4')
    expect(row.expires_at - row.created_at).toBe(EMAIL_VERIFY_TTL_MS)
  })

  it('uses a 30-minute TTL for pin_reset purpose', async () => {
    const db = makeMockDb()
    await generateAuthEmailToken(db, { userId: 'u1', purpose: 'pin_reset' })
    const row = db._rows[0]
    expect(row.expires_at - row.created_at).toBe(PIN_RESET_TTL_MS)
  })

  it('rejects an unknown purpose', async () => {
    const db = makeMockDb()
    await expect(
      generateAuthEmailToken(db, { userId: 'u1', purpose: 'random_thing' })
    ).rejects.toThrow(/purpose/i)
  })
})

describe('consumeAuthEmailToken', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-07T12:00:00Z'))
  })

  it('returns userId and marks consumed for a valid token', async () => {
    const db = makeMockDb()
    const { token } = await generateAuthEmailToken(db, {
      userId: 'u1', purpose: 'email_verify',
    })
    const out = await consumeAuthEmailToken(db, { token, purpose: 'email_verify' })
    expect(out.ok).toBe(true)
    expect(out.userId).toBe('u1')
    expect(db._rows[0].consumed_at).toBe(Date.now())
  })

  it('rejects when token is unknown', async () => {
    const db = makeMockDb()
    const out = await consumeAuthEmailToken(db, {
      token: 'a'.repeat(64), purpose: 'email_verify',
    })
    expect(out.ok).toBe(false)
    expect(out.reason).toBe('not_found')
  })

  it('rejects when purpose mismatches', async () => {
    const db = makeMockDb()
    const { token } = await generateAuthEmailToken(db, {
      userId: 'u1', purpose: 'email_verify',
    })
    const out = await consumeAuthEmailToken(db, { token, purpose: 'pin_reset' })
    expect(out.ok).toBe(false)
    expect(out.reason).toBe('not_found')
  })

  it('rejects when token has already been consumed', async () => {
    const db = makeMockDb()
    const { token } = await generateAuthEmailToken(db, {
      userId: 'u1', purpose: 'pin_reset',
    })
    const first = await consumeAuthEmailToken(db, { token, purpose: 'pin_reset' })
    expect(first.ok).toBe(true)
    const replay = await consumeAuthEmailToken(db, { token, purpose: 'pin_reset' })
    expect(replay.ok).toBe(false)
    expect(replay.reason).toBe('already_consumed')
  })

  it('rejects when token is expired', async () => {
    const db = makeMockDb()
    const { token } = await generateAuthEmailToken(db, {
      userId: 'u1', purpose: 'pin_reset',
    })
    // Advance past the 30min TTL
    vi.advanceTimersByTime(PIN_RESET_TTL_MS + 1000)
    const out = await consumeAuthEmailToken(db, { token, purpose: 'pin_reset' })
    expect(out.ok).toBe(false)
    expect(out.reason).toBe('expired')
  })

  it('rejects malformed tokens without hitting the DB', async () => {
    const db = makeMockDb()
    const out1 = await consumeAuthEmailToken(db, { token: '', purpose: 'pin_reset' })
    const out2 = await consumeAuthEmailToken(db, { token: null, purpose: 'pin_reset' })
    const out3 = await consumeAuthEmailToken(db, { token: 'short', purpose: 'pin_reset' })
    expect(out1.ok).toBe(false)
    expect(out2.ok).toBe(false)
    expect(out3.ok).toBe(false)
  })
})
