import { useAuthStore } from '../stores/authStore'

const API_BASE = import.meta.env.VITE_AUTH_API_URL || 'https://funeralpress-auth-api.ghwmelite.workers.dev'

export async function apiFetch(path, options = {}) {
  const token = await useAuthStore.getState().getToken()
  if (!token) throw new Error('Not authenticated')

  const headers = { ...options.headers }
  headers['Authorization'] = `Bearer ${token}`
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  let res = await fetch(`${API_BASE}${path}`, { ...options, headers })

  // Retry once on 401 (token may have just expired)
  if (res.status === 401) {
    const newToken = await useAuthStore.getState().getToken()
    if (newToken && newToken !== token) {
      headers['Authorization'] = `Bearer ${newToken}`
      res = await fetch(`${API_BASE}${path}`, { ...options, headers })
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(err.error || 'Request failed')
  }
  return res.json()
}

export async function apiUploadImage(designId, fieldPath, blob) {
  const formData = new FormData()
  formData.append('file', blob)
  formData.append('designId', designId)
  formData.append('fieldPath', fieldPath)

  const token = await useAuthStore.getState().getToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/images/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })

  if (!res.ok) throw new Error('Image upload failed')
  const data = await res.json()
  return `${API_BASE}${data.url}`
}
