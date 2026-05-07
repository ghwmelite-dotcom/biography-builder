// Resend-based email templates for the phone+PIN auth flow.
//
// All three functions follow the same contract:
//   - return { ok: true } on 2xx Resend response
//   - return { ok: false, error } on send failure
//   - never throw — failure is the caller's signal to log + continue
//
// The signup verification email is the only one whose failure is
// user-facing; the other two are non-fatal background notifications.

const RESEND_FROM = 'FuneralPress <notifications@funeralpress.org>'

function recipientName(name, email) {
  if (name && name.trim()) return name.trim().split(/\s+/)[0]
  if (email) return email.split('@')[0]
  return 'there'
}

async function sendResend(env, { to, subject, text, html }) {
  if (!env?.RESEND_API_KEY) {
    console.warn('[authEmails] RESEND_API_KEY missing; skipping email to', to)
    return { ok: false, error: 'resend_not_configured' }
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: RESEND_FROM, to: [to], subject, text, html }),
    })
    if (!res.ok) {
      const errBody = await res.text().catch(() => '')
      console.error('[authEmails] Resend non-2xx:', res.status, errBody.slice(0, 200))
      return { ok: false, error: `resend_${res.status}` }
    }
    return { ok: true }
  } catch (e) {
    console.error('[authEmails] Resend send failed:', e?.message || e)
    return { ok: false, error: e?.message || 'resend_threw' }
  }
}

/**
 * Sign-up email-verification email. Sent right after a phone+PIN signup.
 * The link points at /auth/verify-email?token=... in the SPA, which calls
 * POST /auth/phone/verify-email.
 */
export async function sendVerifyEmail(env, { to, name, verifyLink }) {
  const safe = recipientName(name, to)
  const subject = 'Verify your FuneralPress account'
  const text = `Hi ${safe},

Welcome to FuneralPress. Please confirm this email so we can help you recover your PIN if you ever forget it:

${verifyLink}

This link expires in 24 hours. If you didn't sign up, please ignore this email.

— The FuneralPress team`
  const html = `<p>Hi ${safe},</p>
<p>Welcome to FuneralPress. Please confirm this email so we can help you recover your PIN if you ever forget it:</p>
<p><a href="${verifyLink}">${verifyLink}</a></p>
<p>This link expires in 24 hours. If you didn't sign up, please ignore this email.</p>
<p>— The FuneralPress team</p>`
  return sendResend(env, { to, subject, text, html })
}

/**
 * PIN-reset email. Sent on the Forgot PIN flow, only when the user's email
 * is verified. Link points at /auth/reset-pin?token=... → calls
 * POST /auth/phone/reset.
 */
export async function sendPinResetEmail(env, { to, name, resetLink }) {
  const safe = recipientName(name, to)
  const subject = 'Reset your FuneralPress PIN'
  const text = `Hi ${safe},

We received a request to reset your FuneralPress PIN. To set a new one, click the link below:

${resetLink}

This link expires in 30 minutes. If you didn't request this, you can safely ignore this email — your PIN won't change.

— The FuneralPress team`
  const html = `<p>Hi ${safe},</p>
<p>We received a request to reset your FuneralPress PIN. To set a new one, click the link below:</p>
<p><a href="${resetLink}">${resetLink}</a></p>
<p>This link expires in 30 minutes. If you didn't request this, you can safely ignore this email — your PIN won't change.</p>
<p>— The FuneralPress team</p>`
  return sendResend(env, { to, subject, text, html })
}

/**
 * "Your PIN was changed" notification. Sent every time a PIN is changed,
 * either via Reset (forgot flow) or via the authenticated Change PIN form.
 * Provides an audit trail so a user notices unauthorized PIN changes.
 */
export async function sendPinChangedEmail(env, { to, name, ipAddress }) {
  const safe = recipientName(name, to)
  const when = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC'
  const ipLine = ipAddress ? ` from IP ${ipAddress}` : ''
  const subject = 'Your FuneralPress PIN was changed'
  const text = `Hi ${safe},

Your FuneralPress PIN was changed at ${when}${ipLine}.

If this was you, no action is needed.
If this was not you, contact support@funeralpress.org immediately.

— The FuneralPress team`
  const html = `<p>Hi ${safe},</p>
<p>Your FuneralPress PIN was changed at <strong>${when}</strong>${ipLine}.</p>
<p>If this was you, no action is needed.</p>
<p>If this was not you, contact <a href="mailto:support@funeralpress.org">support@funeralpress.org</a> immediately.</p>
<p>— The FuneralPress team</p>`
  return sendResend(env, { to, subject, text, html })
}
