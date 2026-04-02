import { create } from 'zustand'
import { apiFetch } from '../utils/apiClient'
import { trackEvent } from '../utils/trackEvent'

const CACHE_KEY = 'fp-purchases'

function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return null
}

function saveCache(data) {
  try {
    if (data) localStorage.setItem(CACHE_KEY, JSON.stringify(data))
    else localStorage.removeItem(CACHE_KEY)
  } catch { /* ignore */ }
}

export const usePurchaseStore = create((set, get) => ({
  credits: 0,
  unlockedDesigns: [],
  isUnlimited: false,
  isLoading: false,
  checkoutOpen: false,
  pendingDownload: null, // { designId, productType }
  subscription: null,

  fetchStatus: async () => {
    set({ isLoading: true })
    try {
      const data = await apiFetch('/payments/status')
      const state = {
        credits: data.credits,
        isUnlimited: data.isUnlimited,
        unlockedDesigns: data.unlockedDesigns || [],
      }
      set({ ...state, isLoading: false })
      saveCache(state)
    } catch {
      // Fall back to cache
      const cached = loadCache()
      if (cached) set({ ...cached, isLoading: false })
      else set({ isLoading: false })
    }
  },

  hydrateFromUser: (user) => {
    if (!user) return
    const state = {
      credits: user.credits ?? 0,
      isUnlimited: user.isUnlimited ?? false,
      unlockedDesigns: user.unlockedDesigns ?? [],
    }
    set(state)
    saveCache(state)
  },

  fetchSubscription: async () => {
    try {
      const data = await apiFetch('/subscriptions/status')
      set({ subscription: data.hasSubscription ? data : null })
    } catch {
      // Subscription status is non-critical
    }
  },

  hasActiveSubscription: () => {
    const { subscription } = get()
    return subscription && subscription.hasSubscription && subscription.status === 'active'
  },

  canDownload: (designId) => {
    const { isUnlimited, unlockedDesigns, subscription } = get()
    if (isUnlimited || unlockedDesigns.includes(designId)) return true
    if (subscription && subscription.hasSubscription && subscription.status === 'active' && subscription.monthlyCreditsRemaining > 0) return true
    return false
  },

  requestDownload: (designId, productType) => {
    if (get().canDownload(designId)) return true // already unlocked
    set({ checkoutOpen: true, pendingDownload: { designId, productType } })
    return false
  },

  handlePaymentSuccess: async (reference) => {
    const data = await apiFetch('/payments/verify', {
      method: 'POST',
      body: JSON.stringify({ reference }),
    })
    const state = {
      credits: data.credits,
      isUnlimited: data.isUnlimited,
      unlockedDesigns: data.unlockedDesigns || [],
    }
    set(state)
    saveCache(state)
    trackEvent('payment_completed', { credits: data.credits, isUnlimited: data.isUnlimited })
    return data
  },

  unlockDesign: async (designId, productType) => {
    const data = await apiFetch('/payments/unlock-design', {
      method: 'POST',
      body: JSON.stringify({ designId, productType }),
    })
    const state = {
      credits: data.credits,
      isUnlimited: data.isUnlimited,
      unlockedDesigns: data.unlockedDesigns || [],
    }
    set(state)
    saveCache(state)
    return data
  },

  closeCheckout: () => set({ checkoutOpen: false, pendingDownload: null }),

  clear: () => {
    set({ credits: 0, unlockedDesigns: [], isUnlimited: false, isLoading: false, checkoutOpen: false, pendingDownload: null, subscription: null })
    saveCache(null)
  },
}))
