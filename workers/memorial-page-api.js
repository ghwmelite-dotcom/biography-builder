/**
 * Cloudflare Worker - Memorial Page API
 *
 * POST / - Save memorial data, returns unique ID
 * GET /:id - Retrieve memorial data
 *
 * DEPLOYMENT:
 * 1. Create KV namespace "MEMORIAL_PAGES" in Cloudflare Dashboard
 * 2. Create Worker named "brochure-memorial-api"
 * 3. Bind KV namespace: MEMORIAL_PAGES_KV -> MEMORIAL_PAGES
 * 4. Deploy this code
 * 5. Bind D1 database: DB -> funeralpress-db (for tweet queue + notifications)
 * 6. Set secret: RESEND_API_KEY (for admin email notifications)
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
}

function generateId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let id = ''
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)]
  }
  return id
}

const ADMIN_EMAIL = 'oh84dev@funeralpress.org'

async function notifyAdmin(env, type, title, detail = {}) {
  if (env.DB) {
    try {
      await env.DB.prepare(
        `INSERT INTO admin_notifications (type, title, detail) VALUES (?, ?, ?)`
      ).bind(type, title, JSON.stringify(detail)).run()
    } catch (e) {
      console.error('Notification insert failed:', e.message)
    }
  }
  if (env.RESEND_API_KEY) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'FuneralPress <notifications@funeralpress.org>',
          to: [ADMIN_EMAIL],
          subject: `[FuneralPress] ${title}`,
          text: `${title}\n\nDetails:\n${Object.entries(detail).map(([k, v]) => `  ${k}: ${v}`).join('\n')}\n\nTime: ${new Date().toISOString()}\n\nView dashboard: https://funeralpress.org/admin`,
        }),
      })
    } catch (e) {
      console.error('Resend email failed:', e.message)
    }
  }
}

async function handlePost(request, env) {
  try {
    const body = await request.json()

    if (!body.fullName) {
      return new Response(JSON.stringify({ error: "Missing fullName" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      })
    }

    // Generate unique ID or use existing
    let id = body.memorialId || generateId()

    // Check for collision
    const existing = await env.MEMORIAL_PAGES_KV.get(id)
    if (existing && !body.memorialId) {
      id = generateId() + id.slice(0, 2)
    }

    // Store with 1-year TTL (365 days in seconds)
    await env.MEMORIAL_PAGES_KV.put(id, JSON.stringify({
      ...body,
      publishedAt: new Date().toISOString(),
    }), { expirationTtl: 365 * 24 * 60 * 60 })

    // Queue anonymized tweet for X auto-poster
    if (env.DB) {
      try {
        await env.DB.prepare(
          `INSERT INTO tweet_queue (source, content, url, priority) VALUES (?, ?, ?, ?)`
        ).bind(
          'memorial',
          'A new memorial page has been created on FuneralPress. Honor their memory and leave a tribute \u2192',
          `https://funeralpress.org/memorial/${id}`,
          3
        ).run()
      } catch (e) {
        console.error('Tweet queue insert failed:', e.message)
      }
    }

    // Notify admin
    notifyAdmin(env, 'memorial_created', `Memorial page created: ${body.fullName}`, {
      name: body.fullName,
      url: `https://funeralpress.org/memorial/${id}`,
    })

    return new Response(JSON.stringify({ id, url: `https://funeralpress.org/memorial/${id}` }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    })
  }
}

async function handleGet(id, env) {
  try {
    const data = await env.MEMORIAL_PAGES_KV.get(id)

    if (!data) {
      return new Response(JSON.stringify({ error: "Memorial not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      })
    }

    return new Response(data, {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    })
  }
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders })
    }

    const url = new URL(request.url)
    const path = url.pathname.replace(/^\//, '')

    if (request.method === "POST" && (!path || path === '')) {
      return handlePost(request, env)
    }

    if (request.method === "GET" && path) {
      return handleGet(path, env)
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    })
  }
}
