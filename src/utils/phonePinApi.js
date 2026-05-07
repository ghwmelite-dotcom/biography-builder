// Phone + PIN auth client. Talks to the auth-api worker.
// Unlike the generic apiFetch, this helper surfaces both the HTTP status code
// and the parsed body so callers can distinguish 401 vs 409 vs 423 vs 429.

import { useAuthStore } from '../stores/authStore.js'

const AUTH_API = import.meta.env.VITE_AUTH_API_URL || 'https://funeralpress-auth-api.ghwmelite.workers.dev'

class PhonePinError extends Error {
  constructor(message, status, body) {
    super(message)
    this.name = 'PhonePinError'
    this.status = status
    this.body = body || {}
  }
}

async function request(path, { method = 'POST', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = await useAuthStore.getState().getToken()
    if (!token) throw new PhonePinError('Not authenticated', 401, {})
    headers['Authorization'] = `Bearer ${token}`
  }
  const res = await fetch(`${AUTH_API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  let data = {}
  try { data = await res.json() } catch { /* empty body */ }
  if (!res.ok) {
    throw new PhonePinError(
      data.error || data.message || `Request failed (${res.status})`,
      res.status,
      data,
    )
  }
  return data
}

export const phonePinApi = {
  signup: (payload) => request('/auth/phone/signup', { body: payload }),
  login: (payload) => request('/auth/phone/login', { body: payload }),
  forgot: (payload) => request('/auth/phone/forgot', { body: payload }),
  reset: (payload) => request('/auth/phone/reset', { body: payload }),
  verifyEmail: (payload) => request('/auth/phone/verify-email', { body: payload }),
  changePin: (payload) => request('/auth/phone/change-pin', { body: payload, auth: true }),
}

export { PhonePinError }
