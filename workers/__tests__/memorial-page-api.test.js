import { describe, it, expect, vi } from 'vitest'

import worker from '../memorial-page-api.js'

function makeMockDb() {
  const inserts = []
  return {
    _inserts: inserts,
    prepare: (sql) => ({
      bind: (...args) => ({
        run: async () => { inserts.push({ sql, args }); return { meta: { changes: 1 } } },
        first: async () => null,
        all: async () => ({ results: [] }),
      }),
    }),
  }
}

function makeEnv({ kvSeed = {}, rateSeed = {} } = {}) {
  const kvMap = new Map(Object.entries(kvSeed))
  const rateMap = new Map(Object.entries(rateSeed))
  const putSpy = vi.fn(async (k, v, _opts) => { kvMap.set(k, v) })
  return {
    ENVIRONMENT: 'dev',
    DB: makeMockDb(),
    MEMORIAL_PAGES_KV: {
      get: async (k) => kvMap.get(k) || null,
      put: putSpy,
      delete: async (k) => kvMap.delete(k),
    },
    RATE_LIMITS: {
      get: async (k) => rateMap.get(k) || null,
      put: async (k, v, _opts) => { rateMap.set(k, v) },
    },
    _kv: kvMap,
    _rate: rateMap,
    _putSpy: putSpy,
  }
}

function makeReq(method, path, { body = null, headers = {} } = {}) {
  const url = `https://example.com${path}`
  const init = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'CF-Connecting-IP': '1.2.3.4',
      'Origin': 'http://localhost:5173',
      ...headers,
    },
  }
  if (body !== null) init.body = JSON.stringify(body)
  return new Request(url, init)
}

describe('memorial-page-api worker', () => {
  it('POST / with valid body returns 200, generates slug from fullName, stores in KV', async () => {
    const env = makeEnv()
    const req = makeReq('POST', '/', { body: { fullName: 'Kwame Mensah Asante', age: 78 } })
    const res = await worker.fetch(req, env)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.id).toMatch(/^[a-z0-9]{8}$/)
    expect(json.url).toBe(`https://funeralpress.org/memorial/${json.id}`)

    expect(env._putSpy).toHaveBeenCalled()
    const [putKey, putValue] = env._putSpy.mock.calls[0]
    expect(putKey).toBe(json.id)
    const stored = JSON.parse(putValue)
    // Slug: lowercase, hyphenated, ends with last 6 of id
    expect(stored.slug).toMatch(/^kwame-mensah-asante-[a-z0-9]{6}$/)
    expect(stored.slug.endsWith(json.id.slice(-6))).toBe(true)
    expect(stored.publishedAt).toBeTruthy()
  })

  it('POST / missing fullName returns 400', async () => {
    const env = makeEnv()
    const req = makeReq('POST', '/', { body: { age: 50 } })
    const res = await worker.fetch(req, env)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('Missing fullName')
  })

  it('POST / with memorialId provided reuses that id when KV is empty', async () => {
    const env = makeEnv()
    const req = makeReq('POST', '/', {
      body: { fullName: 'Ama Boateng', memorialId: 'custom01' },
    })
    const res = await worker.fetch(req, env)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.id).toBe('custom01')
    expect(env._kv.has('custom01')).toBe(true)
  })

  it('GET /:id returns 200 with stored JSON when KV has the entry', async () => {
    const stored = { fullName: 'Yaw Owusu', slug: 'yaw-owusu-abcdef', publishedAt: '2026-01-01T00:00:00Z' }
    const env = makeEnv({ kvSeed: { mem123: JSON.stringify(stored) } })
    const req = makeReq('GET', '/mem123')
    const res = await worker.fetch(req, env)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.fullName).toBe('Yaw Owusu')
    expect(json.slug).toBe('yaw-owusu-abcdef')
  })

  it('GET /:id returns 404 when KV is empty', async () => {
    const env = makeEnv()
    const req = makeReq('GET', '/nonexistent')
    const res = await worker.fetch(req, env)
    expect(res.status).toBe(404)
    const json = await res.json()
    expect(json.error).toBe('Memorial not found')
  })

  it('OPTIONS returns 204 with CORS headers', async () => {
    const env = makeEnv()
    const req = makeReq('OPTIONS', '/', { headers: { Origin: 'http://localhost:5173' } })
    const res = await worker.fetch(req, env)
    expect(res.status).toBe(204)
    expect(res.headers.get('Access-Control-Allow-Methods')).toContain('POST')
    expect(res.headers.get('Access-Control-Allow-Origin')).toBeTruthy()
  })

  it('GET /health returns 200 with status ok', async () => {
    const env = makeEnv()
    const req = makeReq('GET', '/health')
    const res = await worker.fetch(req, env)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.status).toBe('ok')
    expect(json.service).toBe('memorial-api')
  })

  it('GET is rate limited (429) when read counter is at limit', async () => {
    const env = makeEnv({ rateSeed: { 'rate:1.2.3.4:memorial:read': '120' } })
    const req = makeReq('GET', '/anyid')
    const res = await worker.fetch(req, env)
    expect(res.status).toBe(429)
  })

  it('POST is rate limited (429) when write counter is at limit', async () => {
    const env = makeEnv({ rateSeed: { 'rate:1.2.3.4:memorial:write': '10' } })
    const req = makeReq('POST', '/', { body: { fullName: 'Test User' } })
    const res = await worker.fetch(req, env)
    expect(res.status).toBe(429)
  })
})
