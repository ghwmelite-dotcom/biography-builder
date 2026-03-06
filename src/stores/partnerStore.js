import { create } from 'zustand'
import { apiFetch } from '../utils/apiClient'

export const usePartnerStore = create((set) => ({
  profile: null,
  referrals: [],
  isLoadingProfile: false,
  isLoadingReferrals: false,

  fetchProfile: async () => {
    set({ isLoadingProfile: true })
    try {
      const data = await apiFetch('/partner/me')
      set({ profile: data.partner, isLoadingProfile: false })
    } catch {
      set({ profile: null, isLoadingProfile: false })
    }
  },

  fetchReferrals: async () => {
    set({ isLoadingReferrals: true })
    try {
      const data = await apiFetch('/partner/referrals')
      set({ referrals: data.referrals || [], isLoadingReferrals: false })
    } catch {
      set({ referrals: [], isLoadingReferrals: false })
    }
  },

  updateProfile: async (data) => {
    await apiFetch('/partner/update-profile', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  uploadLogo: async (file) => {
    const formData = new FormData()
    formData.append('logo', file)
    const { useAuthStore } = await import('./authStore')
    const token = useAuthStore.getState().accessToken
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://funeralpress-auth-api.ghwmelite.workers.dev'}/partner/upload-logo`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })
    if (!res.ok) throw new Error('Upload failed')
    const data = await res.json()
    return data.logoUrl
  },

  fetchPublicPartner: async (code) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://funeralpress-auth-api.ghwmelite.workers.dev'}/partner/public/${code}`)
    if (!res.ok) return null
    return await res.json()
  },

  clear: () => set({ profile: null, referrals: [], isLoadingProfile: false, isLoadingReferrals: false }),
}))
