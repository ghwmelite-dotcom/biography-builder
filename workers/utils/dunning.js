// ============================================================
// Subscription dunning email helper
// ------------------------------------------------------------
// Cron-driven daily sweep that walks past_due subscriptions
// through 3 stages:
//   stage 0 → 1 : Day 1 retry email (sent immediately when entering past_due)
//   stage 1 → 2 : Day 3 warning email (≥ 2 days after stage 1)
//   stage 2 → 3 : Day 7 downgrade — clear monthly_credits_remaining
//                 and send "downgraded" email (≥ 4 days after stage 2)
//   stage 3     : terminal, skip
//
// Designs/memorials are always preserved across downgrade — only
// the Pro entitlement (monthly credits) is revoked.
// ============================================================

const RESEND_FROM = 'FuneralPress <notifications@funeralpress.org>'
// Used when no Paystack manage link can be fetched. Points at a generic page
// so the email is never broken; per-user manage links replace this in
// runDunningCron via fetchPaystackManageLink().
const FALLBACK_PORTAL_URL = 'https://funeralpress.org'
// Min ms between Day 1 → Day 3 (2 days) and Day 3 → downgrade (4 days)
const DAY_MS = 86400000
const DAY3_DELAY_MS = 2 * DAY_MS
const DOWNGRADE_DELAY_MS = 4 * DAY_MS

function planLabel(plan) {
  return plan === 'pro_annual' ? 'annual' : 'monthly'
}

function recipientName(user) {
  if (!user) return 'there'
  return user.name || user.email?.split('@')[0] || 'there'
}

/**
 * Fetch a per-subscription Paystack-hosted "manage subscription" link so the
 * dunning email lets the user update their card without leaving the email.
 * Returns the fallback URL if Paystack rejects, the env is misconfigured, or
 * the subscription code is missing — the email must always have a usable link.
 */
export async function fetchPaystackManageLink(env, subscriptionCode) {
  if (!subscriptionCode || !env?.PAYSTACK_SECRET_KEY) return FALLBACK_PORTAL_URL
  try {
    const res = await fetch(
      `https://api.paystack.co/subscription/${encodeURIComponent(subscriptionCode)}/manage/link`,
      { headers: { Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}` } }
    )
    if (!res.ok) return FALLBACK_PORTAL_URL
    const data = await res.json().catch(() => null)
    return data?.data?.link || FALLBACK_PORTAL_URL
  } catch (e) {
    console.error('[dunning] Paystack manage-link fetch failed:', e?.message || e)
    return FALLBACK_PORTAL_URL
  }
}

// ─── Email templates ────────────────────────────────────────────────────────

export function dunningDay1Email(user, sub, manageUrl = FALLBACK_PORTAL_URL) {
  const name = recipientName(user)
  const plan = planLabel(sub?.plan)
  const url = manageUrl || FALLBACK_PORTAL_URL
  const subject = 'Your FuneralPress Pro payment failed'
  const text = `Hi ${name},

We couldn't process your Pro ${plan} subscription payment. We'll retry automatically over the next few days.

Update your payment method here: ${url}

Your Pro features remain active for now.

— The FuneralPress team`
  const html = `<p>Hi ${name},</p>
<p>We couldn't process your Pro ${plan} subscription payment. We'll retry automatically over the next few days.</p>
<p>Update your payment method here: <a href="${url}">${url}</a></p>
<p>Your Pro features remain active for now.</p>
<p>— The FuneralPress team</p>`
  return { subject, text, html }
}

export function dunningDay3Email(user, sub, manageUrl = FALLBACK_PORTAL_URL) {
  const name = recipientName(user)
  const plan = planLabel(sub?.plan)
  const url = manageUrl || FALLBACK_PORTAL_URL
  const subject = 'Action needed: your FuneralPress Pro access ends in 4 days'
  const text = `Hi ${name},

Your Pro ${plan} subscription is past due. We'll downgrade your account in 4 days unless payment goes through.

Your designs and memorials will be preserved.

Update payment: ${url}

— The FuneralPress team`
  const html = `<p>Hi ${name},</p>
<p>Your Pro ${plan} subscription is past due. We'll downgrade your account in 4 days unless payment goes through.</p>
<p>Your designs and memorials will be preserved.</p>
<p>Update payment: <a href="${url}">${url}</a></p>
<p>— The FuneralPress team</p>`
  return { subject, text, html }
}

export function dunningDowngradeEmail(user, sub, manageUrl = FALLBACK_PORTAL_URL) {
  const name = recipientName(user)
  const plan = planLabel(sub?.plan)
  const url = manageUrl || FALLBACK_PORTAL_URL
  const subject = 'Your FuneralPress Pro access has been downgraded'
  const text = `Hi ${name},

Your Pro ${plan} subscription has been downgraded to the free tier after multiple failed payment attempts.

All your designs and memorials are preserved.

Resubscribe anytime: ${url}

— The FuneralPress team`
  const html = `<p>Hi ${name},</p>
<p>Your Pro ${plan} subscription has been downgraded to the free tier after multiple failed payment attempts.</p>
<p>All your designs and memorials are preserved.</p>
<p>Resubscribe anytime: <a href="${url}">${url}</a></p>
<p>— The FuneralPress team</p>`
  return { subject, text, html }
}

// ─── Resend dispatcher ──────────────────────────────────────────────────────

async function sendResendEmail(env, to, { subject, html, text }) {
  if (!env.RESEND_API_KEY) {
    console.warn('[dunning] RESEND_API_KEY missing; skipping email to', to)
    return false
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [to],
        subject,
        html,
        text,
      }),
    })
    if (!res.ok) {
      const errBody = await res.text().catch(() => '')
      console.error('[dunning] Resend non-2xx:', res.status, errBody.slice(0, 200))
      return false
    }
    return true
  } catch (e) {
    console.error('[dunning] Resend send failed:', e.message)
    return false
  }
}

// ─── Cron entry point ───────────────────────────────────────────────────────

/**
 * Daily dunning sweep. Walks past_due subscriptions through Day 1 / Day 3 /
 * Day 7 downgrade stages and sends Resend emails.
 *
 * Exported for direct testing.
 */
export async function runDunningCron(env) {
  if (!env?.DB) {
    console.warn('[dunning] No DB binding; skipping')
    return { processed: 0, day1: 0, day3: 0, downgraded: 0 }
  }

  // Pull every past_due subscription that has not yet hit terminal stage 3.
  const { results = [] } = await env.DB.prepare(
    `SELECT s.id, s.user_id, s.plan, s.status, s.dunning_stage, s.last_dunning_sent_at,
            s.paystack_subscription_code,
            u.email AS user_email, u.name AS user_name
       FROM subscriptions s
       LEFT JOIN users u ON u.id = s.user_id
      WHERE s.status = 'past_due'
        AND COALESCE(s.dunning_stage, 0) < 3`
  ).bind().all()

  const now = Date.now()
  const nowIso = new Date(now).toISOString()

  let day1 = 0, day3 = 0, downgraded = 0

  for (const row of results) {
    const stage = row.dunning_stage || 0
    const user = { email: row.user_email, name: row.user_name }
    const sub = { id: row.id, plan: row.plan }

    if (!row.user_email) {
      console.warn(`[dunning] Subscription ${row.id} has no user email; skipping`)
      continue
    }

    const lastSentMs = row.last_dunning_sent_at ? Date.parse(row.last_dunning_sent_at) : 0

    if (stage === 0) {
      // Just entered past_due → Day 1 email.
      // Fetch a per-user Paystack manage-subscription URL so the email lets
      // the customer update their card. Falls back to the homepage if
      // Paystack is unavailable — see fetchPaystackManageLink().
      const manageUrl = await fetchPaystackManageLink(env, row.paystack_subscription_code)
      const tpl = dunningDay1Email(user, sub, manageUrl)
      await sendResendEmail(env, row.user_email, tpl)
      await env.DB.prepare(
        `UPDATE subscriptions
            SET dunning_stage = 1,
                last_dunning_sent_at = ?,
                updated_at = datetime('now')
          WHERE id = ?`
      ).bind(nowIso, row.id).run()
      await env.DB.prepare(
        `INSERT INTO subscription_events (subscription_id, event_type, detail) VALUES (?, 'dunning.day1', ?)`
      ).bind(row.id, JSON.stringify({ userId: row.user_id })).run()
      day1++
    } else if (stage === 1) {
      // Already sent Day 1 → require ≥ 2 days before Day 3
      if (now - lastSentMs < DAY3_DELAY_MS) continue
      const manageUrl = await fetchPaystackManageLink(env, row.paystack_subscription_code)
      const tpl = dunningDay3Email(user, sub, manageUrl)
      await sendResendEmail(env, row.user_email, tpl)
      await env.DB.prepare(
        `UPDATE subscriptions
            SET dunning_stage = 2,
                last_dunning_sent_at = ?,
                updated_at = datetime('now')
          WHERE id = ?`
      ).bind(nowIso, row.id).run()
      await env.DB.prepare(
        `INSERT INTO subscription_events (subscription_id, event_type, detail) VALUES (?, 'dunning.day3', ?)`
      ).bind(row.id, JSON.stringify({ userId: row.user_id })).run()
      day3++
    } else if (stage === 2) {
      // Already sent Day 3 → require ≥ 4 more days before downgrade
      if (now - lastSentMs < DOWNGRADE_DELAY_MS) continue
      const manageUrl = await fetchPaystackManageLink(env, row.paystack_subscription_code)
      const tpl = dunningDowngradeEmail(user, sub, manageUrl)
      await sendResendEmail(env, row.user_email, tpl)
      await env.DB.prepare(
        `UPDATE subscriptions
            SET dunning_stage = 3,
                monthly_credits_remaining = 0,
                last_dunning_sent_at = ?,
                updated_at = datetime('now')
          WHERE id = ?`
      ).bind(nowIso, row.id).run()
      await env.DB.prepare(
        `INSERT INTO subscription_events (subscription_id, event_type, detail) VALUES (?, 'dunning.downgrade', ?)`
      ).bind(row.id, JSON.stringify({ userId: row.user_id, reason: 'multiple_failed_payments' })).run()
      downgraded++
    }
    // stage >= 3 is filtered out by the SELECT; no-op safety
  }

  return { processed: results.length, day1, day3, downgraded }
}
