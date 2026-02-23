// FuneralPress Auth API Worker
// Bindings: DB (D1), IMAGES (R2), JWT_SECRET (secret), GOOGLE_CLIENT_ID (var)

const ALLOWED_ORIGINS = [
  'https://funeral-brochure-app.pages.dev',
  'https://funeralpress.org',
  'https://www.funeralpress.org',
  'http://localhost:5173',
  'http://localhost:4173',
]

function getCorsOrigin(request) {
  const origin = request.headers.get('Origin') || ''
  // Allow any *.funeral-brochure-app.pages.dev preview URL
  if (ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.funeral-brochure-app.pages.dev')) {
    return origin
  }
  return ALLOWED_ORIGINS[0]
}

function corsHeaders(request) {
  return {
    'Access-Control-Allow-Origin': getCorsOrigin(request),
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  }
}

function json(data, status = 200, request) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(request) },
  })
}

function error(message, status = 400, request) {
  return json({ error: message }, status, request)
}

// ─── JWT helpers (Workers-compatible, no Node libs) ─────────────────────────

async function signJWT(payload, secret) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const enc = new TextEncoder()
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  const data = `${headerB64}.${payloadB64}`
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data))
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  return `${data}.${sigB64}`
}

async function verifyJWT(token, secret) {
  try {
    const [headerB64, payloadB64, sigB64] = token.split('.')
    if (!headerB64 || !payloadB64 || !sigB64) return null
    const enc = new TextEncoder()
    const data = `${headerB64}.${payloadB64}`
    const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify'])
    const sig = Uint8Array.from(atob(sigB64.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))
    const valid = await crypto.subtle.verify('HMAC', key, sig, enc.encode(data))
    if (!valid) return null
    const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')))
    if (payload.exp && Date.now() / 1000 > payload.exp) return null
    return payload
  } catch {
    return null
  }
}

// ─── Google ID token verification via JWKS ──────────────────────────────────

let cachedGoogleKeys = null
let cachedGoogleKeysAt = 0

async function getGooglePublicKeys() {
  if (cachedGoogleKeys && Date.now() - cachedGoogleKeysAt < 3600000) return cachedGoogleKeys
  const res = await fetch('https://www.googleapis.com/oauth2/v3/certs')
  const data = await res.json()
  cachedGoogleKeys = data.keys
  cachedGoogleKeysAt = Date.now()
  return cachedGoogleKeys
}

async function verifyGoogleIdToken(idToken, clientId) {
  const parts = idToken.split('.')
  if (parts.length !== 3) return { error: 'Token is not a valid JWT (wrong number of parts)' }

  const [headerB64, payloadB64, sigB64] = parts

  let header, payload
  try {
    header = JSON.parse(atob(headerB64.replace(/-/g, '+').replace(/_/g, '/')))
    payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')))
  } catch (e) {
    return { error: `Failed to decode token: ${e.message}` }
  }

  // Check claims
  if (payload.aud !== clientId) {
    return { error: `Audience mismatch: token aud=${payload.aud}, expected=${clientId}` }
  }
  if (!['accounts.google.com', 'https://accounts.google.com'].includes(payload.iss)) {
    return { error: `Invalid issuer: ${payload.iss}` }
  }
  if (payload.exp < Date.now() / 1000) {
    return { error: 'Token expired' }
  }

  // Verify signature with Google's public key
  let keys
  try {
    keys = await getGooglePublicKeys()
  } catch (e) {
    return { error: `Failed to fetch Google JWKS: ${e.message}` }
  }

  const jwk = keys.find(k => k.kid === header.kid)
  if (!jwk) {
    return { error: `No matching Google key for kid=${header.kid}` }
  }

  try {
    const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify'])
    const sig = Uint8Array.from(atob(sigB64.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))
    const enc = new TextEncoder()
    const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, sig, enc.encode(`${headerB64}.${payloadB64}`))
    if (!valid) return { error: 'Signature verification failed' }
  } catch (e) {
    return { error: `Signature verification error: ${e.message}` }
  }

  return { payload }
}

// ─── Auth middleware ─────────────────────────────────────────────────────────

async function authenticate(request, env) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.slice(7)
  return verifyJWT(token, env.JWT_SECRET)
}

function generateId() {
  return crypto.randomUUID()
}

async function hashToken(token) {
  const enc = new TextEncoder()
  const hash = await crypto.subtle.digest('SHA-256', enc.encode(token))
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}

function randomHex(bytes = 64) {
  const arr = new Uint8Array(bytes)
  crypto.getRandomValues(arr)
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('')
}

// ─── Route handlers ─────────────────────────────────────────────────────────

async function handleGoogleLogin(request, env) {
  const body = await request.json()
  const { credential } = body
  if (!credential) return error('Missing credential', 400, request)

  const result = await verifyGoogleIdToken(credential, env.GOOGLE_CLIENT_ID)
  if (result.error) {
    return error(result.error, 401, request)
  }
  const googleUser = result.payload

  // Upsert user
  let user = await env.DB.prepare('SELECT * FROM users WHERE google_id = ?').bind(googleUser.sub).first()
  if (!user) {
    user = {
      id: generateId(),
      google_id: googleUser.sub,
      email: googleUser.email,
      name: googleUser.name,
      picture: googleUser.picture,
    }
    await env.DB.prepare('INSERT INTO users (id, google_id, email, name, picture) VALUES (?, ?, ?, ?, ?)')
      .bind(user.id, user.google_id, user.email, user.name, user.picture).run()
  } else {
    await env.DB.prepare("UPDATE users SET name = ?, picture = ?, email = ?, updated_at = datetime('now') WHERE id = ?")
      .bind(googleUser.name, googleUser.picture, googleUser.email, user.id).run()
    user.name = googleUser.name
    user.picture = googleUser.picture
    user.email = googleUser.email
  }

  // Issue JWT (1hr)
  const accessToken = await signJWT({ sub: user.id, email: user.email, exp: Math.floor(Date.now() / 1000) + 3600 }, env.JWT_SECRET)

  // Issue refresh token (30 days)
  const refreshRaw = randomHex(64)
  const refreshHash = await hashToken(refreshRaw)
  const expiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString()
  await env.DB.prepare('INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)')
    .bind(generateId(), user.id, refreshHash, expiresAt).run()

  return json({
    user: { id: user.id, email: user.email, name: user.name, picture: user.picture },
    accessToken,
    refreshToken: refreshRaw,
  }, 200, request)
}

async function handleRefresh(request, env) {
  const { refreshToken } = await request.json()
  if (!refreshToken) return error('Missing refresh token', 400, request)

  const tokenHash = await hashToken(refreshToken)
  const row = await env.DB.prepare('SELECT * FROM refresh_tokens WHERE token_hash = ?').bind(tokenHash).first()
  if (!row) return error('Invalid refresh token', 401, request)
  if (new Date(row.expires_at) < new Date()) {
    await env.DB.prepare('DELETE FROM refresh_tokens WHERE id = ?').bind(row.id).run()
    return error('Refresh token expired', 401, request)
  }

  const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(row.user_id).first()
  if (!user) return error('User not found', 404, request)

  // Rotate refresh token
  await env.DB.prepare('DELETE FROM refresh_tokens WHERE id = ?').bind(row.id).run()
  const newRefreshRaw = randomHex(64)
  const newRefreshHash = await hashToken(newRefreshRaw)
  const expiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString()
  await env.DB.prepare('INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)')
    .bind(generateId(), user.id, newRefreshHash, expiresAt).run()

  const accessToken = await signJWT({ sub: user.id, email: user.email, exp: Math.floor(Date.now() / 1000) + 3600 }, env.JWT_SECRET)

  return json({
    user: { id: user.id, email: user.email, name: user.name, picture: user.picture },
    accessToken,
    refreshToken: newRefreshRaw,
  }, 200, request)
}

async function handleLogout(request, env, userId) {
  const { refreshToken } = await request.json().catch(() => ({}))
  if (refreshToken) {
    const tokenHash = await hashToken(refreshToken)
    await env.DB.prepare('DELETE FROM refresh_tokens WHERE token_hash = ? AND user_id = ?').bind(tokenHash, userId).run()
  }
  return json({ ok: true }, 200, request)
}

async function handleGetMe(request, env, userId) {
  const user = await env.DB.prepare('SELECT id, email, name, picture FROM users WHERE id = ?').bind(userId).first()
  if (!user) return error('User not found', 404, request)
  return json({ user }, 200, request)
}

// ─── Design CRUD ────────────────────────────────────────────────────────────

async function handleListDesigns(request, env, userId) {
  const url = new URL(request.url)
  const type = url.searchParams.get('type')
  let rows
  if (type) {
    rows = await env.DB.prepare('SELECT id, product_type, name, updated_at FROM designs WHERE user_id = ? AND product_type = ? ORDER BY updated_at DESC')
      .bind(userId, type).all()
  } else {
    rows = await env.DB.prepare('SELECT id, product_type, name, updated_at FROM designs WHERE user_id = ? ORDER BY updated_at DESC')
      .bind(userId).all()
  }
  return json({ designs: rows.results }, 200, request)
}

async function handleUpsertDesign(request, env, userId, designId) {
  const { product_type, name, data, updated_at } = await request.json()
  if (!product_type || !data) return error('Missing product_type or data', 400, request)

  const updatedAt = updated_at || new Date().toISOString()
  await env.DB.prepare(
    `INSERT INTO designs (id, user_id, product_type, name, data, updated_at) VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET name = excluded.name, data = excluded.data, updated_at = excluded.updated_at`
  ).bind(designId, userId, product_type, name || 'Untitled', typeof data === 'string' ? data : JSON.stringify(data), updatedAt).run()

  return json({ ok: true, id: designId }, 200, request)
}

async function handleGetDesign(request, env, userId, designId) {
  const row = await env.DB.prepare('SELECT id, product_type, name, data, updated_at FROM designs WHERE id = ? AND user_id = ?')
    .bind(designId, userId).first()
  if (!row) return error('Design not found', 404, request)
  let data = row.data
  try { data = JSON.parse(data) } catch { /* keep as string */ }
  return json({ design: { id: row.id, product_type: row.product_type, name: row.name, data, updated_at: row.updated_at } }, 200, request)
}

async function handleDeleteDesign(request, env, userId, designId) {
  await env.DB.prepare('DELETE FROM designs WHERE id = ? AND user_id = ?').bind(designId, userId).run()
  return json({ ok: true }, 200, request)
}

async function handleBulkSync(request, env, userId) {
  const { designs } = await request.json()
  if (!Array.isArray(designs)) return error('designs must be an array', 400, request)

  const stmt = env.DB.prepare(
    `INSERT INTO designs (id, user_id, product_type, name, data, updated_at) VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET name = excluded.name, data = excluded.data, updated_at = excluded.updated_at`
  )

  const batch = designs.map(d =>
    stmt.bind(d.id, userId, d.product_type, d.name || 'Untitled', typeof d.data === 'string' ? d.data : JSON.stringify(d.data), d.updated_at || new Date().toISOString())
  )

  if (batch.length > 0) {
    await env.DB.batch(batch)
  }

  return json({ ok: true, count: batch.length }, 200, request)
}

// ─── Image upload/serve ─────────────────────────────────────────────────────

async function handleImageUpload(request, env, userId) {
  const formData = await request.formData()
  const file = formData.get('file')
  const designId = formData.get('designId') || 'misc'
  const fieldPath = formData.get('fieldPath') || 'unknown'

  if (!file) return error('No file provided', 400, request)

  const ext = file.name?.split('.').pop() || 'jpg'
  const key = `${userId}/${designId}/${fieldPath}-${Date.now()}.${ext}`

  await env.IMAGES.put(key, file.stream(), {
    httpMetadata: { contentType: file.type || 'image/jpeg' },
  })

  return json({ url: `/images/${key}` }, 200, request)
}

async function handleImageServe(request, env, key) {
  const object = await env.IMAGES.get(key)
  if (!object) return new Response('Not found', { status: 404, headers: corsHeaders(request) })

  const headers = new Headers(corsHeaders(request))
  object.writeHttpMetadata(headers)
  headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  return new Response(object.body, { headers })
}

// ─── Router ─────────────────────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const path = url.pathname
    const method = request.method

    // CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(request) })
    }

    try {
      // Public routes
      if (method === 'POST' && path === '/auth/google') return await handleGoogleLogin(request, env)
      if (method === 'POST' && path === '/auth/refresh') return await handleRefresh(request, env)
      if (method === 'GET' && path.startsWith('/images/')) return await handleImageServe(request, env, path.slice(8))

      // Authenticated routes
      const jwtPayload = await authenticate(request, env)
      if (!jwtPayload) return error('Unauthorized', 401, request)
      const userId = jwtPayload.sub

      if (method === 'POST' && path === '/auth/logout') return await handleLogout(request, env, userId)
      if (method === 'GET' && path === '/user/me') return await handleGetMe(request, env, userId)
      if (method === 'GET' && path === '/designs') return await handleListDesigns(request, env, userId)
      if (method === 'POST' && path === '/designs/sync') return await handleBulkSync(request, env, userId)
      if (method === 'POST' && path === '/images/upload') return await handleImageUpload(request, env, userId)

      // Design CRUD with :id
      const designMatch = path.match(/^\/designs\/([^/]+)$/)
      if (designMatch) {
        const designId = designMatch[1]
        if (method === 'GET') return await handleGetDesign(request, env, userId, designId)
        if (method === 'PUT') return await handleUpsertDesign(request, env, userId, designId)
        if (method === 'DELETE') return await handleDeleteDesign(request, env, userId, designId)
      }

      return error('Not found', 404, request)
    } catch (err) {
      // Always return CORS headers even on unexpected errors
      return json({ error: err.message || 'Internal server error' }, 500, request)
    }
  },
}
