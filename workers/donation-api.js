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
      // Routes will be added in subsequent tasks (18-30).
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
