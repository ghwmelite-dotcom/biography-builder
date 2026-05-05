import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  runDunningCron,
  dunningDay1Email,
  dunningDay3Email,
  dunningDowngradeEmail,
} from '../utils/dunning.js'

const DAY_MS = 86400000

// ─── Mock D1 ────────────────────────────────────────────────────────────────
function makeMockDb({ subs = [] }) {
  const state = {
    subs: subs.map(s => ({ ...s })),
    updates: [],
    events: [],
  }

  return {
    _state: state,
    prepare: (sql) => ({
      bind: (...args) => ({
        run: async () => {
          if (sql.includes('UPDATE subscriptions')) {
            state.updates.push({ sql, args })
            const id = args[args.length - 1]
            const sub = state.subs.find(s => s.id === id)
            if (!sub) return { meta: { changes: 0 } }
            // Set dunning_stage based on which stage update this is
            if (sql.includes('dunning_stage = 1')) {
              sub.dunning_stage = 1
              sub.last_dunning_sent_at = args[0]
            } else if (sql.includes('dunning_stage = 2')) {
              sub.dunning_stage = 2
              sub.last_dunning_sent_at = args[0]
            } else if (sql.includes('dunning_stage = 3')) {
              sub.dunning_stage = 3
              sub.monthly_credits_remaining = 0
              sub.last_dunning_sent_at = args[0]
            }
            return { meta: { changes: 1 } }
          }
          if (sql.includes('INSERT INTO subscription_events')) {
            state.events.push({ subscription_id: args[0], detail: args[1], sql })
            return { meta: { changes: 1 } }
          }
          return { meta: { changes: 0 } }
        },
        first: async () => null,
        all: async () => {
          if (sql.includes('FROM subscriptions')) {
            // Filter status='past_due' AND dunning_stage<3 (mirroring SELECT)
            return {
              results: state.subs
                .filter(s => s.status === 'past_due' && (s.dunning_stage || 0) < 3)
                .map(s => ({
                  id: s.id,
                  user_id: s.user_id,
                  plan: s.plan,
                  status: s.status,
                  dunning_stage: s.dunning_stage || 0,
                  last_dunning_sent_at: s.last_dunning_sent_at || null,
                  user_email: s.user_email,
                  user_name: s.user_name,
                })),
            }
          }
          return { results: [] }
        },
      }),
    }),
  }
}

function makeEnv({ subs = [], resendKey = 'rs_test_fake' } = {}) {
  return {
    RESEND_API_KEY: resendKey,
    DB: makeMockDb({ subs }),
  }
}

function isoDaysAgo(days) {
  return new Date(Date.now() - days * DAY_MS).toISOString()
}

// ─── Email helper template tests ────────────────────────────────────────────

describe('dunning email templates', () => {
  const user = { name: 'Akua Mensah', email: 'akua@example.com' }
  const subMonthly = { id: 's1', plan: 'pro_monthly' }
  const subAnnual = { id: 's2', plan: 'pro_annual' }

  it('Day 1 returns subject + html + text', () => {
    const out = dunningDay1Email(user, subMonthly)
    expect(out.subject).toBe('Your FuneralPress Pro payment failed')
    expect(out.text).toContain('Akua Mensah')
    expect(out.text).toContain('monthly')
    expect(out.html).toContain('funeralpress.org/account')
    expect(out.text).toContain('funeralpress.org/account')
  })

  it('Day 3 mentions 4 days warning + annual plan', () => {
    const out = dunningDay3Email(user, subAnnual)
    expect(out.subject).toContain('4 days')
    expect(out.text).toContain('annual')
    expect(out.text).toContain('preserved')
  })

  it('Downgrade email confirms preservation', () => {
    const out = dunningDowngradeEmail(user, subMonthly)
    expect(out.subject).toContain('downgraded')
    expect(out.text).toContain('preserved')
    expect(out.text).toContain('Resubscribe')
  })

  it('falls back to "there" when user has no name/email', () => {
    const out = dunningDay1Email(null, subMonthly)
    expect(out.text).toContain('Hi there')
  })

  it('uses email prefix when name missing', () => {
    const out = dunningDay1Email({ email: 'foo@bar.com' }, subMonthly)
    expect(out.text).toContain('Hi foo')
  })
})

// ─── Cron sweep tests ───────────────────────────────────────────────────────

describe('runDunningCron', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, text: async () => 'ok' })
  })

  it('sends Day 1 email when status=past_due and dunning_stage=0', async () => {
    const env = makeEnv({
      subs: [{
        id: 'sub-1',
        user_id: 'u1',
        plan: 'pro_monthly',
        status: 'past_due',
        dunning_stage: 0,
        last_dunning_sent_at: null,
        user_email: 'u1@example.com',
        user_name: 'Kofi',
      }],
    })
    const out = await runDunningCron(env)
    expect(out.day1).toBe(1)
    expect(out.day3).toBe(0)
    expect(out.downgraded).toBe(0)
    // One Resend POST
    expect(global.fetch).toHaveBeenCalledTimes(1)
    const callUrl = global.fetch.mock.calls[0][0]
    expect(callUrl).toBe('https://api.resend.com/emails')
    // Subscription advanced to stage 1
    expect(env.DB._state.subs[0].dunning_stage).toBe(1)
    expect(env.DB._state.subs[0].last_dunning_sent_at).toBeTruthy()
    // Audit event written
    const day1Event = env.DB._state.events.find(e => e.sql.includes("'dunning.day1'"))
    expect(day1Event).toBeDefined()
    expect(day1Event.subscription_id).toBe('sub-1')
  })

  it('sends Day 3 email when stage=1 and 2+ days have passed', async () => {
    const env = makeEnv({
      subs: [{
        id: 'sub-2',
        user_id: 'u2',
        plan: 'pro_annual',
        status: 'past_due',
        dunning_stage: 1,
        last_dunning_sent_at: isoDaysAgo(3), // 3 days ago > 2-day threshold
        user_email: 'u2@example.com',
        user_name: 'Yaa',
      }],
    })
    const out = await runDunningCron(env)
    expect(out.day3).toBe(1)
    expect(out.day1).toBe(0)
    expect(env.DB._state.subs[0].dunning_stage).toBe(2)
    const evt = env.DB._state.events.find(e => e.sql.includes("'dunning.day3'"))
    expect(evt).toBeDefined()
  })

  it('does NOT send Day 3 email when stage=1 but only 1 day passed', async () => {
    const env = makeEnv({
      subs: [{
        id: 'sub-3',
        user_id: 'u3',
        plan: 'pro_monthly',
        status: 'past_due',
        dunning_stage: 1,
        last_dunning_sent_at: isoDaysAgo(1),
        user_email: 'u3@example.com',
        user_name: 'Ama',
      }],
    })
    const out = await runDunningCron(env)
    expect(out.day1).toBe(0)
    expect(out.day3).toBe(0)
    expect(out.downgraded).toBe(0)
    expect(global.fetch).not.toHaveBeenCalled()
    expect(env.DB._state.subs[0].dunning_stage).toBe(1) // unchanged
  })

  it('downgrades when stage=2 and 4+ days have passed', async () => {
    const env = makeEnv({
      subs: [{
        id: 'sub-4',
        user_id: 'u4',
        plan: 'pro_monthly',
        status: 'past_due',
        dunning_stage: 2,
        last_dunning_sent_at: isoDaysAgo(5), // > 4 day threshold
        user_email: 'u4@example.com',
        user_name: 'Esi',
        monthly_credits_remaining: 8,
      }],
    })
    const out = await runDunningCron(env)
    expect(out.downgraded).toBe(1)
    expect(env.DB._state.subs[0].dunning_stage).toBe(3)
    expect(env.DB._state.subs[0].monthly_credits_remaining).toBe(0)
    const evt = env.DB._state.events.find(e => e.sql.includes("'dunning.downgrade'"))
    expect(evt).toBeDefined()
    expect(evt.detail).toContain('multiple_failed_payments')
  })

  it('skips terminal stage 3 subscriptions (no-op)', async () => {
    const env = makeEnv({
      subs: [{
        id: 'sub-5',
        user_id: 'u5',
        plan: 'pro_monthly',
        status: 'past_due',
        dunning_stage: 3,
        last_dunning_sent_at: isoDaysAgo(30),
        user_email: 'u5@example.com',
        user_name: 'Kwesi',
      }],
    })
    const out = await runDunningCron(env)
    expect(out.processed).toBe(0)
    expect(out.day1).toBe(0)
    expect(out.day3).toBe(0)
    expect(out.downgraded).toBe(0)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('skips subscription with no user email', async () => {
    const env = makeEnv({
      subs: [{
        id: 'sub-6',
        user_id: 'u6',
        plan: 'pro_monthly',
        status: 'past_due',
        dunning_stage: 0,
        last_dunning_sent_at: null,
        user_email: null,
        user_name: null,
      }],
    })
    const out = await runDunningCron(env)
    expect(out.day1).toBe(0)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('processes multiple subscriptions in one sweep', async () => {
    const env = makeEnv({
      subs: [
        {
          id: 'a', user_id: 'u_a', plan: 'pro_monthly', status: 'past_due',
          dunning_stage: 0, last_dunning_sent_at: null,
          user_email: 'a@x.com', user_name: 'A',
        },
        {
          id: 'b', user_id: 'u_b', plan: 'pro_annual', status: 'past_due',
          dunning_stage: 1, last_dunning_sent_at: isoDaysAgo(3),
          user_email: 'b@x.com', user_name: 'B',
        },
        {
          id: 'c', user_id: 'u_c', plan: 'pro_monthly', status: 'past_due',
          dunning_stage: 2, last_dunning_sent_at: isoDaysAgo(5),
          user_email: 'c@x.com', user_name: 'C',
        },
      ],
    })
    const out = await runDunningCron(env)
    expect(out.day1).toBe(1)
    expect(out.day3).toBe(1)
    expect(out.downgraded).toBe(1)
    expect(out.processed).toBe(3)
  })

  it('returns zeroes when DB binding missing', async () => {
    const out = await runDunningCron({})
    expect(out.processed).toBe(0)
    expect(out.day1).toBe(0)
  })

  it('still updates DB state when RESEND_API_KEY is missing (logs warning)', async () => {
    const env = makeEnv({
      subs: [{
        id: 'sub-x', user_id: 'ux', plan: 'pro_monthly', status: 'past_due',
        dunning_stage: 0, last_dunning_sent_at: null,
        user_email: 'ux@x.com', user_name: 'X',
      }],
      resendKey: undefined,
    })
    delete env.RESEND_API_KEY
    const out = await runDunningCron(env)
    expect(out.day1).toBe(1)
    // No fetch attempted when key is missing
    expect(global.fetch).not.toHaveBeenCalled()
    expect(env.DB._state.subs[0].dunning_stage).toBe(1)
  })
})
