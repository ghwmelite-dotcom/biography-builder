import { useAuthStore } from '../stores/authStore'
import { apiFetch, apiUploadImage } from './apiClient'

// ─── Product type → localStorage keys and image field paths ─────────────────

const PRODUCT_CONFIG = {
  brochure: {
    storageKey: 'funeral-brochure-data',
    listKey: 'funeral-brochures-list',
    imageFields: ['coverPhoto', 'biographyPhotos.*', 'galleryPhotos.*.src', 'tributes.*.photos.*'],
  },
  poster: {
    storageKey: 'obituary-poster-data',
    listKey: 'obituary-posters-list',
    imageFields: ['coverPhoto'],
  },
  invitation: {
    storageKey: 'funeral-invitation-data',
    listKey: 'funeral-invitations-list',
    imageFields: ['coverPhoto'],
  },
  thankYou: {
    storageKey: 'funeral-thankyou-data',
    listKey: 'funeral-thankyou-list',
    imageFields: ['coverPhoto'],
  },
  booklet: {
    storageKey: 'funeral-booklet-data',
    listKey: 'funeral-booklet-list',
    imageFields: ['coverPhoto', 'galleryPhotos.*.src'],
  },
  banner: {
    storageKey: 'funeral-banner-data',
    listKey: 'funeral-banner-list',
    imageFields: ['coverPhoto'],
  },
  budget: {
    storageKey: 'funeral-budget-data',
    listKey: 'funeral-budget-list',
    imageFields: [],
  },
  collage: {
    storageKey: 'funeral-collage-data',
    listKey: 'funeral-collage-list',
    imageFields: ['cells.*.photo'],
  },
  reminder: {
    storageKey: 'funeral-reminder-data',
    listKey: null,
    imageFields: [],
  },
}

// ─── Base64 detection + upload ──────────────────────────────────────────────

function isBase64(str) {
  return typeof str === 'string' && str.startsWith('data:image/')
}

function base64ToBlob(base64) {
  const [meta, data] = base64.split(',')
  const mime = meta.match(/:(.*?);/)?.[1] || 'image/jpeg'
  const bytes = atob(data)
  const arr = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
  return new Blob([arr], { type: mime })
}

// Walk a design object, find base64 strings at specified field paths, upload them
async function extractAndUploadImages(data, designId, imageFields) {
  if (!imageFields.length) return data
  const clone = JSON.parse(JSON.stringify(data))

  for (const fieldPath of imageFields) {
    await walkAndUpload(clone, fieldPath.split('.'), designId, fieldPath)
  }
  return clone
}

async function walkAndUpload(obj, parts, designId, fullPath) {
  if (!obj || parts.length === 0) return

  const [current, ...rest] = parts

  if (current === '*') {
    // Wildcard: iterate array or object values
    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        if (rest.length === 0) {
          // This array element is the value to check
          if (isBase64(obj[i])) {
            try {
              obj[i] = await apiUploadImage(designId, `${fullPath}-${i}`, base64ToBlob(obj[i]))
            } catch { /* keep base64 on failure */ }
          }
        } else {
          await walkAndUpload(obj[i], rest, designId, fullPath)
        }
      }
    }
    return
  }

  if (rest.length === 0) {
    // Leaf field
    if (isBase64(obj[current])) {
      try {
        obj[current] = await apiUploadImage(designId, fullPath, base64ToBlob(obj[current]))
      } catch { /* keep base64 on failure */ }
    }
  } else {
    if (Array.isArray(obj[current])) {
      // Next part should handle array traversal
      await walkAndUpload(obj[current], rest, designId, fullPath)
    } else if (obj[current] && typeof obj[current] === 'object') {
      await walkAndUpload(obj[current], rest, designId, fullPath)
    }
  }
}

// ─── Debounced sync ─────────────────────────────────────────────────────────

const syncTimers = {}

export function syncDesign(productType, id, data, name, updatedAt) {
  const key = `${productType}-${id}`
  if (syncTimers[key]) clearTimeout(syncTimers[key])

  syncTimers[key] = setTimeout(async () => {
    delete syncTimers[key]
    if (!useAuthStore.getState().isLoggedIn()) return

    const config = PRODUCT_CONFIG[productType]
    if (!config) return

    useAuthStore.getState().setSyncing(true)
    try {
      const cleaned = await extractAndUploadImages(data, id, config.imageFields)
      await apiFetch(`/designs/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          product_type: productType,
          name: name || 'Untitled',
          data: cleaned,
          updated_at: updatedAt || new Date().toISOString(),
        }),
      })
    } catch (err) {
      console.warn('[sync] Failed to sync design:', err.message)
    } finally {
      useAuthStore.getState().setSyncing(false)
    }
  }, 2000) // 2 second debounce
}

export async function deleteDesignFromCloud(id) {
  if (!useAuthStore.getState().isLoggedIn()) return
  try {
    await apiFetch(`/designs/${id}`, { method: 'DELETE' })
  } catch (err) {
    console.warn('[sync] Failed to delete from cloud:', err.message)
  }
}

// ─── First-login migration ─────────────────────────────────────────────────

export function getLocalDesignCounts() {
  const counts = {}
  let total = 0

  for (const [type, config] of Object.entries(PRODUCT_CONFIG)) {
    if (type === 'reminder') {
      // Reminder is a single object, not a list
      try {
        const raw = localStorage.getItem(config.storageKey)
        if (raw) {
          const data = JSON.parse(raw)
          if (data.customReminders?.length > 0) {
            counts[type] = data.customReminders.length
            total += counts[type]
          }
        }
      } catch { /* ignore */ }
      continue
    }

    if (!config.listKey) continue
    try {
      const raw = localStorage.getItem(config.listKey)
      if (raw) {
        const list = JSON.parse(raw)
        if (list.length > 0) {
          counts[type] = list.length
          total += list.length
        }
      }
    } catch { /* ignore */ }
  }

  return { counts, total }
}

export async function migrateLocalToCloud(onProgress) {
  const designs = []
  let processed = 0

  for (const [type, config] of Object.entries(PRODUCT_CONFIG)) {
    if (type === 'reminder' || !config.listKey) continue

    try {
      const raw = localStorage.getItem(config.listKey)
      if (!raw) continue
      const list = JSON.parse(raw)

      for (const entry of list) {
        const dataRaw = localStorage.getItem(`${config.storageKey}-${entry.id}`)
        if (!dataRaw) continue
        let data = JSON.parse(dataRaw)

        // Upload images
        data = await extractAndUploadImages(data, entry.id, config.imageFields)

        designs.push({
          id: entry.id,
          product_type: type,
          name: entry.name || 'Untitled',
          data,
          updated_at: entry.updatedAt || new Date().toISOString(),
        })

        processed++
        if (onProgress) onProgress(processed)
      }
    } catch (err) {
      console.warn(`[migrate] Error processing ${type}:`, err.message)
    }
  }

  if (designs.length > 0) {
    // Batch sync in chunks of 10
    for (let i = 0; i < designs.length; i += 10) {
      const chunk = designs.slice(i, i + 10)
      await apiFetch('/designs/sync', {
        method: 'POST',
        body: JSON.stringify({ designs: chunk }),
      })
    }
  }

  useAuthStore.getState().setMigrated()
  return designs.length
}

export async function fetchDesignsFromCloud(productType) {
  if (!useAuthStore.getState().isLoggedIn()) return []
  try {
    const res = await apiFetch(`/designs?type=${productType}`)
    return res.designs || []
  } catch {
    return []
  }
}

export async function fetchCloudDesignList() {
  if (!useAuthStore.getState().isLoggedIn()) return []
  try {
    const res = await apiFetch('/designs')
    return res.designs || []
  } catch {
    return []
  }
}

export async function loadCloudDesign(id) {
  const res = await apiFetch(`/designs/${id}`)
  return res.design
}
