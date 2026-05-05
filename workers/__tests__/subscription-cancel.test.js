import { describe, it, expect, vi, beforeEach } from 'vitest'
import worker from '../auth-api.js'
import { signJWT } from '../utils/jwt.js'

const JWT_SECRET = 'test-jwt-secret'
const USER_ID = 'user-uuid-1'
const SUB_ID = 'sub-uuid-1'

function makeMockDb({ subscription = null }) {
  const state = {
    subscription: subscription ? { ...subscription } : null,
    updates: [],
    inserts: [],
  }
  return {
    _state: state,
    prepare: (sql) => ({
      bind: (...args) => ({
        run: async () => {
          if (sql.includes('UPDATE subscriptions')) {
            state.updates.push({ sql, args })
            return { meta: { changes: 1 } }
          }
          if (sql.includes('INSERT INTO subscription_events') || sql.includes('INSERT INTO audit_log')) {
            state.inserts.push({ sql, args })
            return { meta: { changes: 1 } }
          }
          return { meta: { changes: 0 } }
        },
        first: async () => {
          if (sql.includes('FROM subscriptions') && sql.includes('user_id')) {
            return state.subscription
          }
          if (sql.includes('FROM users')) {
            return { id: USER_ID, email: 'u@example.com' }
          }
          return null
        },
        all: async () => ({ results: [] }),
      }),
    }),
  }
}

function makeEnv({ subscription = null } = {}) {
  return {
    JWT_SECRET,
    PAYSTACK_SECRET_KEY: 'sk_test_fake',
    OTP_PEPPER: 'test-pepper',
    DB: makeMockDb({ subscription }),
    MEMORIAL_PAGES_KV: { get: async () => null, put: async () => undefined },
    RATE_LIMITS: { get: async () => null, put: async () => undefined },
    OTP_KV: { get: async () => null, put: async () => undefined },
  }
}

async function makeJwt(sub = USER_ID) {
  return signJWT({ sub: String(sub), exp: Math.floor(Date.now() / 1000) + 3600 }, JWT_SECRET)
}

function cancelReq(jwt) {
  return new Request('https://example.com/subscriptions/cancel', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
      'CF-Connecting-IP': '1.2.3.4',
    },
  })
}

function activeSub(overrides = {}) {
  return {
    id: SUB_ID,
    user_id: USER_ID,
    plan: 'pro_monthly',
    status: 'active',
    monthly_credits_remaining: 12,
    paystack_subscription_code: 'SUB_xyz',
    paystack_email_token: 'tok_xyz',
    cancel_at_period_end: 0,
    ...overrides,
  }
}

describe('POST /subscriptions/cancel', () => {
  beforeEach(() => {
    // Stub Paystack disable call so cancel doesn't reach the network
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ status: true }) })
  })

  it('zeroes monthly_credits_remaining immediately to prevent entitlement leakage', async () => {
    const env = makeEnv({ subscription: activeSub() })
    const jwt = await makeJwt()
    const res = await worker.fetch(cancelReq(jwt), env)
    expect(res.status).toBe(200)

    const subUpdate = env.DB._state.updates.find((u) => u.sql.includes('cancel_at_period_end'))
    expect(subUpdate, 'expected an UPDATE setting cancel_at_period_end').toBeTruthy()
    expect(subUpdate.sql).toMatch(/monthly_credits_remaining\s*=\s*0/)
  })

  it('still flags cancel_at_period_end and inserts subscription_events row', async () => {
    const env = makeEnv({ subscription: activeSub() })
    const jwt = await makeJwt()
    await worker.fetch(cancelReq(jwt), env)

    const subUpdate = env.DB._state.updates.find((u) => u.sql.includes('cancel_at_period_end = 1'))
    expect(subUpdate).toBeTruthy()

    const eventInsert = env.DB._state.inserts.find((i) => i.sql.includes("subscription_events"))
    expect(eventInsert).toBeTruthy()
  })

  it('returns 400 when no active subscription exists', async () => {
    const env = makeEnv({ subscription: null })
    const jwt = await makeJwt()
    const res = await worker.fetch(cancelReq(jwt), env)
    expect(res.status).toBe(400)
  })
})
