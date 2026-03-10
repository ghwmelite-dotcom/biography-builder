import { create } from 'zustand'

const API = import.meta.env.VITE_API_URL || 'https://funeralpress-auth-api.ghwmelite.workers.dev'

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  filter: '',

  fetchNotifications: async (limit = 50, offset = 0) => {
    const token = localStorage.getItem('fp_token')
    if (!token) return
    set({ loading: true })
    try {
      const filterParam = get().filter ? `&type=${get().filter}` : ''
      const res = await fetch(
        `${API}/admin/notifications?limit=${limit}&offset=${offset}${filterParam}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      set({ notifications: data.notifications, unreadCount: data.unreadCount, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  markAsRead: async (id) => {
    const token = localStorage.getItem('fp_token')
    if (!token) return
    await fetch(`${API}/admin/notifications/read`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    set(s => ({
      notifications: s.notifications.map(n => n.id === id ? { ...n, is_read: 1 } : n),
      unreadCount: Math.max(0, s.unreadCount - 1),
    }))
  },

  markAllRead: async () => {
    const token = localStorage.getItem('fp_token')
    if (!token) return
    await fetch(`${API}/admin/notifications/read`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ all: true }),
    })
    set(s => ({
      notifications: s.notifications.map(n => ({ ...n, is_read: 1 })),
      unreadCount: 0,
    }))
  },

  setFilter: (filter) => set({ filter }),
}))

export default useNotificationStore
