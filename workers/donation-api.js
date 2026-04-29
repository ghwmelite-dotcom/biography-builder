// FuneralPress Donation API Worker
// Owns: donations, donor wall, family-head approval, Paystack webhooks.
// Bindings: DB (D1), MEMORIAL_PAGES_KV, RATE_LIMITS, OTP_KV
// Secrets: PAYSTACK_SECRET_KEY, PAYSTACK_WEBHOOK_SECRET, JWT_SECRET, OTP_PEPPER,
//          TERMII_API_KEY, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER,
//          RESEND_API_KEY, OXR_APP_ID

import { withSecurityHeaders } from './utils/securityHeaders.js'
import { sanitizeInput } from './utils/sanitize.js'
import { logDonationAudit, getClientIP } from './utils/auditLog.js'
import { verifyJWT, signJWT } from './utils/jwt.js'
import { featureFlag } from './utils/featureFlag.js'
import { createSubaccount, resolveAccount } from './utils/paystack.js'

const ALLOWED_ORIGINS = [
  'https://funeral-brochure-app.pages.dev',
  'https://funeralpress.org',
  'https://www.funeralpress.org',
  'http://localhost:5173',
  'http://localhost:4173',
]

function corsOrigin(req) {
  const o = req.headers.get('Origin') || ''
  if (ALLOWED_ORIGINS.includes(o) || o.endsWith('.funeral-brochure-app.pages.dev')) return o
  return ALLOWED_ORIGINS[0]
}

function corsHeaders(req) {
  return {
    'Access-Control-Allow-Origin': corsOrigin(req),
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  }
}

function json(data, status = 200, request) {
  return withSecurityHeaders(new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(request) },
  }))
}

function error(message, status = 400, request, code = null) {
  return json(code ? { error: message, code } : { error: message }, status, request)
}

async function authenticate(request, env) {
  const h = request.headers.get('Authorization') || ''
  if (!h.startsWith('Bearer ')) return null
  const payload = await verifyJWT(h.slice(7), env.JWT_SECRET)
  return payload
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(request) })
    }

    const url = new URL(request.url)
    const path = url.pathname

    // Global kill switch — applies to charge/init only; admin and read paths still work.
    if (featureFlag(env, 'DONATIONS_GLOBAL_PAUSED')) {
      if (path.includes('/donation/charge') || path.includes('/donation/init')) {
        return error('Donations are temporarily paused.', 503, request)
      }
    }

    // Health check (always available)
    if (path === '/health' && request.method === 'GET') {
      return json({ ok: true, service: 'donation-api' }, 200, request)
    }

    // Master feature flag — donation rail not enabled yet
    if (!featureFlag(env, 'DONATIONS_ENABLED')) {
      return error('Donation rail not enabled', 503, request)
    }

    try {
      const memorialMatch = path.match(/^\/memorials\/([^/]+)\/donation\/(init|approve|reject|settings|wall|totals|charge)$/)
      if (memorialMatch) {
        const [, memorialId, action] = memorialMatch

        if (action === 'init' && request.method === 'POST') {
          const auth = await authenticate(request, env)
          if (!auth) return error('Auth required', 401, request)

          const body = await request.json().catch(() => ({}))
          const {
            payout_momo_number,
            payout_momo_provider,
            payout_account_name,
            wall_mode,
            goal_amount_pesewas,
            family_head,
          } = body

          // Validation
          if (!payout_momo_number || !/^\+\d{6,15}$/.test(payout_momo_number)) {
            return error('Invalid payout MoMo number', 400, request)
          }
          if (!['mtn', 'vodafone', 'airteltigo'].includes(payout_momo_provider)) {
            return error('Invalid MoMo provider', 400, request)
          }
          if (!payout_account_name || payout_account_name.length > 100) {
            return error('Invalid account name', 400, request)
          }
          if (!['full', 'names_only', 'private'].includes(wall_mode)) {
            return error('Invalid wall_mode', 400, request)
          }
          if (goal_amount_pesewas !== undefined && goal_amount_pesewas !== null) {
            if (!Number.isInteger(goal_amount_pesewas) || goal_amount_pesewas < 100) {
              return error('Invalid goal amount', 400, request)
            }
          }
          if (!family_head || !['self', 'invite'].includes(family_head.mode)) {
            return error('Invalid family_head.mode', 400, request)
          }
          if (family_head.mode === 'invite' && !/^\+\d{6,15}$/.test(family_head.phone || '')) {
            return error('Invalid family_head.phone for invite mode', 400, request)
          }

          // Fetch memorial from KV; verify creator
          const kvRaw = await env.MEMORIAL_PAGES_KV.get(memorialId)
          if (!kvRaw) return error('Memorial not found', 404, request)
          let memorialData
          try { memorialData = JSON.parse(kvRaw) } catch { return error('Memorial corrupted', 500, request) }
          if (Number(memorialData.creator_user_id) !== Number(auth.sub)) {
            return error('Only the memorial creator can enable donations', 403, request)
          }

          // Verify MoMo with Paystack
          const resolved = await resolveAccount({
            secretKey: env.PAYSTACK_SECRET_KEY,
            momoNumber: payout_momo_number,
            providerCode: { mtn: 'MTN', vodafone: 'VOD', airteltigo: 'ATL' }[payout_momo_provider],
          })
          if (!resolved.ok) {
            return error('Could not verify MoMo number. Please check the number and provider.', 400, request)
          }

          // Create Paystack subaccount
          const sub = await createSubaccount({
            secretKey: env.PAYSTACK_SECRET_KEY,
            businessName: `${memorialData.deceased_name || 'Memorial'} Donations`,
            momoNumber: payout_momo_number,
            provider: payout_momo_provider,
            accountName: payout_account_name,
          })
          if (!sub.ok) {
            return error(`Could not create payout account: ${sub.error || 'unknown'}`, 502, request)
          }

          const now = Date.now()
          const slug = memorialData.slug || memorialId
          const sanitizedAccountName = sanitizeInput(payout_account_name)

          if (family_head.mode === 'self') {
            // Self-declared — immediate approval
            await env.DB.prepare(
              `INSERT INTO memorials (
                id, slug, creator_user_id, family_head_user_id, family_head_phone, family_head_name,
                family_head_self_declared, paystack_subaccount_code, payout_momo_number, payout_momo_provider,
                payout_account_name, wall_mode, goal_amount_pesewas, approval_status, approved_at, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
            ).bind(
              memorialId, slug, Number(auth.sub), Number(auth.sub),
              memorialData.creator_phone || null, memorialData.creator_name || null,
              1, sub.subaccount_code, payout_momo_number, payout_momo_provider,
              sanitizedAccountName, wall_mode, goal_amount_pesewas || null,
              'approved', now, now, now
            ).run()

            // Update KV cache
            memorialData.donation = {
              memorial_id: memorialId,
              enabled: true,
              wall_mode,
              goal_amount_pesewas: goal_amount_pesewas || null,
              total_raised_pesewas: 0,
              total_donor_count: 0,
              approval_status: 'approved',
            }
            await env.MEMORIAL_PAGES_KV.put(memorialId, JSON.stringify(memorialData))

            await logDonationAudit(env.DB, {
              memorialId,
              actorUserId: Number(auth.sub),
              action: 'family_head.self_declared',
              detail: {
                declared_name: payout_account_name,
                declared_phone: family_head.phone || null,
                wall_mode, goal_amount_pesewas,
              },
              ipAddress: getClientIP(request),
            })

            return json({
              memorial_id: memorialId,
              approval_status: 'approved',
              subaccount_code: sub.subaccount_code,
            }, 200, request)
          }

          // mode === 'invite'
          if (!family_head.name || family_head.name.length > 100) {
            return error('Invalid family_head.name', 400, request)
          }

          // Generate single-use approval token (JWT, scope='family_head_approval', 24h)
          const tokenPayload = {
            sub: family_head.phone,
            memorial_id: memorialId,
            scope: 'family_head_approval',
            jti: crypto.randomUUID(),
            exp: Math.floor(Date.now() / 1000) + 24 * 3600,
          }
          const approvalToken = await signJWT(tokenPayload, env.JWT_SECRET)

          // Hash for storage (so DB compromise doesn't expose token)
          const tokenHashBuf = await crypto.subtle.digest(
            'SHA-256',
            new TextEncoder().encode(approvalToken)
          )
          const tokenHash = Array.from(new Uint8Array(tokenHashBuf))
            .map(b => b.toString(16).padStart(2, '0')).join('')

          await env.DB.prepare(
            `INSERT INTO memorials (
              id, slug, creator_user_id, family_head_phone, family_head_name, family_head_self_declared,
              paystack_subaccount_code, payout_momo_number, payout_momo_provider, payout_account_name,
              wall_mode, goal_amount_pesewas, approval_status, approval_token_hash, approval_token_expires_at,
              created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          ).bind(
            memorialId, slug, Number(auth.sub),
            family_head.phone, sanitizeInput(family_head.name), 0,
            sub.subaccount_code, payout_momo_number, payout_momo_provider, sanitizedAccountName,
            wall_mode, goal_amount_pesewas || null,
            'pending', tokenHash, tokenPayload.exp * 1000,
            now, now
          ).run()

          // KV cache reflects pending state
          memorialData.donation = {
            memorial_id: memorialId,
            enabled: false,
            wall_mode,
            goal_amount_pesewas: goal_amount_pesewas || null,
            total_raised_pesewas: 0,
            total_donor_count: 0,
            approval_status: 'pending',
          }
          await env.MEMORIAL_PAGES_KV.put(memorialId, JSON.stringify(memorialData))

          // Send SMS via routed provider
          const { selectProvider } = await import('./utils/phoneRouter.js')
          const { sendTermiiSms } = await import('./utils/termii.js')
          const { sendTwilioSms } = await import('./utils/twilioVerify.js')

          let provider
          try { provider = selectProvider(family_head.phone) } catch { provider = null }
          if (!provider) return error('Invalid family head phone country code', 400, request)

          const approvalLink = `https://funeralpress.org/approve/${approvalToken}`
          const smsMessage = `${family_head.name}: You've been named family head for ${memorialData.deceased_name || 'a memorial'} on FuneralPress. Review and approve: ${approvalLink}`

          const sendResult = provider === 'termii'
            ? await sendTermiiSms({ apiKey: env.TERMII_API_KEY, toE164: family_head.phone, message: smsMessage })
            : await sendTwilioSms({
                accountSid: env.TWILIO_ACCOUNT_SID,
                authToken: env.TWILIO_AUTH_TOKEN,
                fromNumber: env.TWILIO_FROM_NUMBER,
                toE164: family_head.phone,
                message: smsMessage,
              })

          if (!sendResult.ok) {
            await logDonationAudit(env.DB, {
              memorialId, actorUserId: Number(auth.sub),
              action: 'family_head.invite_sms_failed',
              detail: { provider, error: sendResult.error },
              ipAddress: getClientIP(request),
            })
          }

          await logDonationAudit(env.DB, {
            memorialId, actorUserId: Number(auth.sub),
            action: 'family_head.invited',
            detail: { phone: family_head.phone, name: family_head.name, expires_at: tokenPayload.exp * 1000 },
            ipAddress: getClientIP(request),
          })

          return json({
            memorial_id: memorialId,
            approval_status: 'pending',
            invite_sent_to: family_head.phone,
            expires_at: tokenPayload.exp * 1000,
          }, 200, request)
        }
      }

      return error('Not found', 404, request)
    } catch (err) {
      console.error('donation-api unhandled', err)
      return error('Internal error', 500, request)
    }
  },

  async scheduled(event, env, ctx) {
    if (!featureFlag(env, 'RECONCILIATION_ENABLED')) return
    // Reconciliation logic added in Task 27
  },
}
