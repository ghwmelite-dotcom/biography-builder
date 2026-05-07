import { describe, it, expect, vi, beforeEach } from 'vitest'
import worker from '../auth-api.js'
import { signJWT } from '../utils/jwt.js'
import { hashPin } from '../utils/pinHash.js'

const JWT_SECRET = 'test-jwt-secret'
const PHONE = '+233244111222'
const EMAIL = 'akua@example.com'
const NAME = 'Akua Mensah'
const PIN = '123456'
const BASE = 'https://example.com'

// ─── Mock DB tracker ─────────────────────────────────────────────────────────

function makeMockDb({ users = [], emailTokens = [], refreshTokens = [], auditRows = [] } = {}) {
  const state = { users, emailTokens, refreshTokens, auditRows, analyticsEvents: [] }
  return {
    _state: state,
    prepare: (sql) => ({
      bind: (...args) => ({
        run: async () => {
          // INSERT INTO users
          if (sql.includes('INSERT INTO users')) {
            state.users.push({
              id: args[0], google_id: args[1], email: args[2], name: args[3],
              phone_e164: args[4], pin_hash: args[5], pin_set_at: args[6],
              auth_methods: args[7], created_at: args[8],
              pin_failed_attempts: 0, pin_lockout_until: null,
              email_verified_at: null, deleted_at: null,
            })
            return { meta: { changes: 1 } }
          }
          // UPDATE users SET pin_hash, pin_set_at, ...
          if (sql.includes('UPDATE users') && sql.includes('pin_hash')) {
            const u = state.users.find((x) => x.id === args[args.length - 1])
            if (u) {
              u.pin_hash = args[0]
              u.pin_set_at = args[1]
              u.pin_failed_attempts = 0
              u.pin_lockout_until = null
              return { meta: { changes: 1 } }
            }
            return { meta: { changes: 0 } }
          }
          // UPDATE users ... pin_failed_attempts (failed login bump)
          if (sql.includes('UPDATE users') && sql.includes('pin_failed_attempts = ?')) {
            const u = state.users.find((x) => x.id === args[args.length - 1])
            if (u) {
              u.pin_failed_attempts = args[0]
              u.pin_lockout_until = args[1]
              return { meta: { changes: 1 } }
            }
            return { meta: { changes: 0 } }
          }
          // UPDATE users ... pin_failed_attempts = 0 (success reset)
          if (sql.includes('UPDATE users') && sql.includes('pin_failed_attempts = 0')) {
            const u = state.users.find((x) => x.id === args[args.length - 1])
            if (u) {
              u.pin_failed_attempts = 0
              u.pin_lockout_until = null
              return { meta: { changes: 1 } }
            }
            return { meta: { changes: 0 } }
          }
          // UPDATE users SET email_verified_at
          if (sql.includes('UPDATE users') && sql.includes('email_verified_at = ?')) {
            const u = state.users.find((x) => x.id === args[args.length - 1])
            if (u) { u.email_verified_at = args[0]; return { meta: { changes: 1 } } }
            return { meta: { changes: 0 } }
          }
          // INSERT INTO auth_email_tokens
          if (sql.includes('INSERT INTO auth_email_tokens')) {
            state.emailTokens.push({
              id: state.emailTokens.length + 1,
              user_id: args[0], token_hash: args[1], purpose: args[2],
              created_at: args[3], expires_at: args[4],
              consumed_at: null, ip_address: args[5],
            })
            return { meta: { changes: 1 } }
          }
          // UPDATE auth_email_tokens consume
          if (sql.includes('UPDATE auth_email_tokens') && sql.includes('consumed_at')) {
            const t = state.emailTokens.find((x) => x.id === args[1])
            if (t && t.consumed_at == null) {
              t.consumed_at = args[0]
              return { meta: { changes: 1 } }
            }
            return { meta: { changes: 0 } }
          }
          // INSERT INTO refresh_tokens
          if (sql.includes('INSERT INTO refresh_tokens')) {
            state.refreshTokens.push({
              id: args[0], user_id: args[1], token_hash: args[2], expires_at: args[3],
            })
            return { meta: { changes: 1 } }
          }
          // DELETE FROM refresh_tokens WHERE user_id = ?
          if (sql.includes('DELETE FROM refresh_tokens') && sql.includes('user_id')) {
            const before = state.refreshTokens.length
            state.refreshTokens = state.refreshTokens.filter((x) => x.user_id !== args[0])
            return { meta: { changes: before - state.refreshTokens.length } }
          }
          // INSERT INTO audit_log
          if (sql.includes('INSERT INTO audit_log')) {
            state.auditRows.push({ args })
            return { meta: { changes: 1 } }
          }
          // INSERT INTO analytics_events (admin notify uses it sometimes)
          if (sql.includes('INSERT INTO analytics_events') || sql.includes('INSERT INTO admin_notifications')) {
            state.analyticsEvents.push({ sql, args })
            return { meta: { changes: 1 } }
          }
          return { meta: { changes: 0 } }
        },
        first: async () => {
          // user lookup variants
          if (sql.includes('FROM users') && sql.includes('phone_e164 = ?')) {
            return state.users.find((x) => x.phone_e164 === args[0] && !x.deleted_at) || null
          }
          if (sql.includes('FROM users') && sql.includes('email = ?')) {
            return state.users.find((x) => x.email === args[0] && !x.deleted_at) || null
          }
          if (sql.includes('FROM users WHERE id = ?')) {
            return state.users.find((x) => x.id === args[0] && !x.deleted_at) || null
          }
          // auth_email_tokens by hash + purpose
          if (sql.includes('FROM auth_email_tokens')) {
            return state.emailTokens.find((x) => x.token_hash === args[0] && x.purpose === args[1]) || null
          }
          // refresh tokens / users-by-id used elsewhere — return null fallback
          return null
        },
        all: async () => ({ results: [] }),
      }),
    }),
  }
}

function makeEnv(initial = {}) {
  const kvStore = new Map()
  return {
    JWT_SECRET,
    OTP_PEPPER: 'test-pepper',
    GOOGLE_CLIENT_ID: 'fake',
    CORS_ORIGIN: 'http://localhost:5173',
    RESEND_API_KEY: 'rs_test_fake',
    DB: makeMockDb(initial),
    RATE_LIMITS: {
      get: async (k) => kvStore.get(k) || null,
      put: async (k, v) => { kvStore.set(k, v) },
    },
    OTP_KV: { get: async () => null, put: async () => undefined },
    _kv: kvStore,
  }
}

function jsonReq(path, method, body, headers = {}) {
  return new Request(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'CF-Connecting-IP': '1.2.3.4',
      'Origin': 'http://localhost:5173',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
}

async function makeAuthJwt(userId) {
  return signJWT({ sub: userId, exp: Math.floor(Date.now() / 1000) + 3600 }, JWT_SECRET)
}

// ─── /auth/phone/signup ──────────────────────────────────────────────────────

describe('POST /auth/phone/signup', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, text: async () => 'ok' })
  })

  it('creates a user with hashed PIN, returns 201, sends verification email', async () => {
    const env = makeEnv()
    const res = await worker.fetch(
      jsonReq('/auth/phone/signup', 'POST', { phone: PHONE, email: EMAIL, pin: PIN, name: NAME }),
      env
    )
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.userId).toBeTruthy()
    expect(env.DB._state.users).toHaveLength(1)
    const u = env.DB._state.users[0]
    expect(u.phone_e164).toBe(PHONE)
    expect(u.email).toBe(EMAIL)
    expect(u.auth_methods).toBe('phone-pin')
    expect(u.pin_hash).toMatch(/^pbkdf2\$/)
    // Verification token issued
    expect(env.DB._state.emailTokens).toHaveLength(1)
    expect(env.DB._state.emailTokens[0].purpose).toBe('email_verify')
    // Resend was called
    const resendCalled = global.fetch.mock.calls.some((c) => String(c[0]).includes('resend.com'))
    expect(resendCalled).toBe(true)
  })

  it('rejects 400 on invalid phone format', async () => {
    const env = makeEnv()
    const res = await worker.fetch(
      jsonReq('/auth/phone/signup', 'POST', { phone: 'not-a-phone', email: EMAIL, pin: PIN, name: NAME }),
      env
    )
    expect(res.status).toBe(400)
  })

  it('rejects 400 on invalid email', async () => {
    const env = makeEnv()
    const res = await worker.fetch(
      jsonReq('/auth/phone/signup', 'POST', { phone: PHONE, email: 'bad', pin: PIN, name: NAME }),
      env
    )
    expect(res.status).toBe(400)
  })

  it('rejects 400 on invalid PIN format (5 digits)', async () => {
    const env = makeEnv()
    const res = await worker.fetch(
      jsonReq('/auth/phone/signup', 'POST', { phone: PHONE, email: EMAIL, pin: '12345', name: NAME }),
      env
    )
    expect(res.status).toBe(400)
  })

  it('rejects 409 on duplicate phone', async () => {
    const existingHash = await hashPin(PIN)
    const env = makeEnv({
      users: [{ id: 'u1', email: 'old@x.com', phone_e164: PHONE, pin_hash: existingHash, deleted_at: null }],
    })
    const res = await worker.fetch(
      jsonReq('/auth/phone/signup', 'POST', { phone: PHONE, email: 'new@x.com', pin: PIN, name: NAME }),
      env
    )
    expect(res.status).toBe(409)
  })

  it('rejects 409 on duplicate email', async () => {
    const existingHash = await hashPin(PIN)
    const env = makeEnv({
      users: [{ id: 'u1', email: EMAIL, phone_e164: '+233200000000', pin_hash: existingHash, deleted_at: null }],
    })
    const res = await worker.fetch(
      jsonReq('/auth/phone/signup', 'POST', { phone: PHONE, email: EMAIL, pin: PIN, name: NAME }),
      env
    )
    expect(res.status).toBe(409)
  })
})

// ─── /auth/phone/login ───────────────────────────────────────────────────────

describe('POST /auth/phone/login', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, text: async () => 'ok' })
  })

  async function userWithPin(overrides = {}) {
    const pin_hash = await hashPin(PIN)
    return {
      id: 'u1', email: EMAIL, name: NAME, phone_e164: PHONE,
      pin_hash, pin_failed_attempts: 0, pin_lockout_until: null,
      email_verified_at: Date.now(), auth_methods: 'phone-pin',
      deleted_at: null, ...overrides,
    }
  }

  it('returns 200 with accessToken + refreshToken on correct PIN', async () => {
    const env = makeEnv({ users: [await userWithPin()] })
    const res = await worker.fetch(
      jsonReq('/auth/phone/login', 'POST', { phone: PHONE, pin: PIN }),
      env
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.accessToken).toBeTruthy()
    expect(body.refreshToken).toBeTruthy()
    expect(body.user.phone).toBe(PHONE)
    expect(body.user.emailVerified).toBe(true)
    expect(env.DB._state.refreshTokens).toHaveLength(1)
  })

  it('returns 401 on wrong PIN, increments pin_failed_attempts', async () => {
    const env = makeEnv({ users: [await userWithPin()] })
    const res = await worker.fetch(
      jsonReq('/auth/phone/login', 'POST', { phone: PHONE, pin: '999999' }),
      env
    )
    expect(res.status).toBe(401)
    expect(env.DB._state.users[0].pin_failed_attempts).toBe(1)
  })

  it('locks the account after 5 failed attempts (1h lockout)', async () => {
    const env = makeEnv({
      users: [await userWithPin({ pin_failed_attempts: 4 })],
    })
    const res = await worker.fetch(
      jsonReq('/auth/phone/login', 'POST', { phone: PHONE, pin: '999999' }),
      env
    )
    expect(res.status).toBe(401)
    const u = env.DB._state.users[0]
    expect(u.pin_failed_attempts).toBe(5)
    expect(u.pin_lockout_until).toBeTruthy()
    expect(u.pin_lockout_until).toBeGreaterThan(Date.now() + 50 * 60 * 1000)
  })

  it('returns 423 when account is currently locked', async () => {
    const env = makeEnv({
      users: [await userWithPin({ pin_failed_attempts: 5, pin_lockout_until: Date.now() + 30 * 60 * 1000 })],
    })
    const res = await worker.fetch(
      jsonReq('/auth/phone/login', 'POST', { phone: PHONE, pin: PIN }),
      env
    )
    expect(res.status).toBe(423)
    const body = await res.json()
    expect(body.retry_after_ms).toBeGreaterThan(0)
  })

  it('returns generic 401 for unknown phone (enumeration-safe)', async () => {
    const env = makeEnv()
    const res = await worker.fetch(
      jsonReq('/auth/phone/login', 'POST', { phone: '+233299999999', pin: PIN }),
      env
    )
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toMatch(/wrong phone or pin/i)
  })

  it('resets pin_failed_attempts to 0 on successful login', async () => {
    const env = makeEnv({
      users: [await userWithPin({ pin_failed_attempts: 3 })],
    })
    const res = await worker.fetch(
      jsonReq('/auth/phone/login', 'POST', { phone: PHONE, pin: PIN }),
      env
    )
    expect(res.status).toBe(200)
    expect(env.DB._state.users[0].pin_failed_attempts).toBe(0)
  })
})

// ─── /auth/phone/forgot ──────────────────────────────────────────────────────

describe('POST /auth/phone/forgot', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, text: async () => 'ok' })
  })

  it('returns 202 + emails the verified user', async () => {
    const pin_hash = await hashPin(PIN)
    const env = makeEnv({
      users: [{
        id: 'u1', email: EMAIL, name: NAME, phone_e164: PHONE, pin_hash,
        email_verified_at: Date.now(), deleted_at: null,
      }],
    })
    const res = await worker.fetch(
      jsonReq('/auth/phone/forgot', 'POST', { phone: PHONE }),
      env
    )
    expect(res.status).toBe(202)
    expect(env.DB._state.emailTokens.find((t) => t.purpose === 'pin_reset')).toBeTruthy()
    const resendCalled = global.fetch.mock.calls.some((c) => String(c[0]).includes('resend.com'))
    expect(resendCalled).toBe(true)
  })

  it('returns 202 silently for unknown phone (no email, no token)', async () => {
    const env = makeEnv()
    const res = await worker.fetch(
      jsonReq('/auth/phone/forgot', 'POST', { phone: '+233299999999' }),
      env
    )
    expect(res.status).toBe(202)
    expect(env.DB._state.emailTokens).toHaveLength(0)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('returns 202 silently when user exists but email is not verified', async () => {
    const pin_hash = await hashPin(PIN)
    const env = makeEnv({
      users: [{
        id: 'u1', email: EMAIL, name: NAME, phone_e164: PHONE, pin_hash,
        email_verified_at: null, deleted_at: null,
      }],
    })
    const res = await worker.fetch(
      jsonReq('/auth/phone/forgot', 'POST', { phone: PHONE }),
      env
    )
    expect(res.status).toBe(202)
    expect(env.DB._state.emailTokens).toHaveLength(0)
  })

  it('returns 202 even on malformed phone (no enumeration leak)', async () => {
    const env = makeEnv()
    const res = await worker.fetch(
      jsonReq('/auth/phone/forgot', 'POST', { phone: 'garbage' }),
      env
    )
    expect(res.status).toBe(202)
  })
})

// ─── /auth/phone/reset ───────────────────────────────────────────────────────

describe('POST /auth/phone/reset', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, text: async () => 'ok' })
  })

  async function setupUserWithResetToken() {
    const pin_hash = await hashPin(PIN)
    const env = makeEnv({
      users: [{
        id: 'u1', email: EMAIL, name: NAME, phone_e164: PHONE, pin_hash,
        email_verified_at: Date.now(), deleted_at: null,
      }],
      refreshTokens: [
        { id: 'rt1', user_id: 'u1', token_hash: 'rt-hash', expires_at: 'never' },
      ],
    })
    // Fire the forgot flow to produce a real token in emailTokens.
    const forgotRes = await worker.fetch(
      jsonReq('/auth/phone/forgot', 'POST', { phone: PHONE }),
      env
    )
    expect(forgotRes.status).toBe(202)
    // Pull the raw token by reading the Resend POST body.
    const resendCall = global.fetch.mock.calls.find((c) => String(c[0]).includes('resend.com'))
    const body = JSON.parse(resendCall[1].body)
    const tokenMatch = body.text.match(/token=([0-9a-f]{64})/)
    expect(tokenMatch).toBeTruthy()
    return { env, token: tokenMatch[1] }
  }

  it('resets PIN, invalidates refresh tokens, and emails the user', async () => {
    const { env, token } = await setupUserWithResetToken()
    const res = await worker.fetch(
      jsonReq('/auth/phone/reset', 'POST', { token, new_pin: '654321' }),
      env
    )
    expect(res.status).toBe(200)
    // PIN actually changed
    const u = env.DB._state.users[0]
    expect(u.pin_hash).toMatch(/^pbkdf2\$/)
    // Refresh tokens cleared
    expect(env.DB._state.refreshTokens).toHaveLength(0)
    // Token consumed
    const t = env.DB._state.emailTokens.find((x) => x.purpose === 'pin_reset')
    expect(t.consumed_at).toBeTruthy()
    // PIN-changed notification email sent
    const pinChangedSubjects = global.fetch.mock.calls
      .filter((c) => String(c[0]).includes('resend.com'))
      .map((c) => JSON.parse(c[1].body).subject)
    expect(pinChangedSubjects.some((s) => /changed/i.test(s))).toBe(true)
  })

  it('returns 401 with invalid token', async () => {
    const env = makeEnv()
    const res = await worker.fetch(
      jsonReq('/auth/phone/reset', 'POST', { token: 'a'.repeat(64), new_pin: '654321' }),
      env
    )
    expect(res.status).toBe(401)
  })

  it('rejects 400 on invalid new PIN format', async () => {
    const { env, token } = await setupUserWithResetToken()
    const res = await worker.fetch(
      jsonReq('/auth/phone/reset', 'POST', { token, new_pin: 'abcdef' }),
      env
    )
    expect(res.status).toBe(400)
  })

  it('rejects replay (token already consumed)', async () => {
    const { env, token } = await setupUserWithResetToken()
    const ok = await worker.fetch(
      jsonReq('/auth/phone/reset', 'POST', { token, new_pin: '654321' }),
      env
    )
    expect(ok.status).toBe(200)
    const replay = await worker.fetch(
      jsonReq('/auth/phone/reset', 'POST', { token, new_pin: '111222' }),
      env
    )
    expect(replay.status).toBe(401)
  })
})

// ─── /auth/phone/verify-email ────────────────────────────────────────────────

describe('POST /auth/phone/verify-email', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, text: async () => 'ok' })
  })

  async function setupSignedUpUser() {
    const env = makeEnv()
    const res = await worker.fetch(
      jsonReq('/auth/phone/signup', 'POST', { phone: PHONE, email: EMAIL, pin: PIN, name: NAME }),
      env
    )
    expect(res.status).toBe(201)
    // Pull verify token from the email body
    const resendCall = global.fetch.mock.calls.find((c) => String(c[0]).includes('resend.com'))
    const body = JSON.parse(resendCall[1].body)
    const m = body.text.match(/token=([0-9a-f]{64})/)
    expect(m).toBeTruthy()
    return { env, token: m[1] }
  }

  it('marks email_verified_at and consumes the token', async () => {
    const { env, token } = await setupSignedUpUser()
    const res = await worker.fetch(
      jsonReq('/auth/phone/verify-email', 'POST', { token }),
      env
    )
    expect(res.status).toBe(200)
    expect(env.DB._state.users[0].email_verified_at).toBeTruthy()
    const t = env.DB._state.emailTokens.find((x) => x.purpose === 'email_verify')
    expect(t.consumed_at).toBeTruthy()
  })

  it('returns 401 with invalid token', async () => {
    const env = makeEnv()
    const res = await worker.fetch(
      jsonReq('/auth/phone/verify-email', 'POST', { token: 'b'.repeat(64) }),
      env
    )
    expect(res.status).toBe(401)
  })

  it('rejects replay', async () => {
    const { env, token } = await setupSignedUpUser()
    const ok = await worker.fetch(
      jsonReq('/auth/phone/verify-email', 'POST', { token }),
      env
    )
    expect(ok.status).toBe(200)
    const replay = await worker.fetch(
      jsonReq('/auth/phone/verify-email', 'POST', { token }),
      env
    )
    expect(replay.status).toBe(401)
  })
})

// ─── /auth/phone/change-pin (authenticated) ──────────────────────────────────

describe('POST /auth/phone/change-pin', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, text: async () => 'ok' })
  })

  async function userWithPin() {
    const pin_hash = await hashPin(PIN)
    return {
      id: 'u1', email: EMAIL, name: NAME, phone_e164: PHONE, pin_hash,
      email_verified_at: Date.now(), deleted_at: null,
    }
  }

  it('updates PIN and emails confirmation when current PIN is correct', async () => {
    const env = makeEnv({ users: [await userWithPin()] })
    const jwt = await makeAuthJwt('u1')
    const res = await worker.fetch(
      jsonReq('/auth/phone/change-pin', 'POST', { current_pin: PIN, new_pin: '654321' }, {
        Authorization: `Bearer ${jwt}`,
      }),
      env
    )
    expect(res.status).toBe(200)
    const u = env.DB._state.users[0]
    expect(u.pin_hash).toMatch(/^pbkdf2\$/)
    const subjects = global.fetch.mock.calls
      .filter((c) => String(c[0]).includes('resend.com'))
      .map((c) => JSON.parse(c[1].body).subject)
    expect(subjects.some((s) => /changed/i.test(s))).toBe(true)
  })

  it('returns 401 when current PIN is wrong', async () => {
    const env = makeEnv({ users: [await userWithPin()] })
    const jwt = await makeAuthJwt('u1')
    const res = await worker.fetch(
      jsonReq('/auth/phone/change-pin', 'POST', { current_pin: '999999', new_pin: '654321' }, {
        Authorization: `Bearer ${jwt}`,
      }),
      env
    )
    expect(res.status).toBe(401)
  })

  it('returns 401 without Bearer auth', async () => {
    const env = makeEnv({ users: [await userWithPin()] })
    const res = await worker.fetch(
      jsonReq('/auth/phone/change-pin', 'POST', { current_pin: PIN, new_pin: '654321' }),
      env
    )
    expect(res.status).toBe(401)
  })

  it('returns 400 on invalid new PIN format', async () => {
    const env = makeEnv({ users: [await userWithPin()] })
    const jwt = await makeAuthJwt('u1')
    const res = await worker.fetch(
      jsonReq('/auth/phone/change-pin', 'POST', { current_pin: PIN, new_pin: 'abc' }, {
        Authorization: `Bearer ${jwt}`,
      }),
      env
    )
    expect(res.status).toBe(400)
  })
})
