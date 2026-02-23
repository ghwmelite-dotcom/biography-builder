import { create } from 'zustand'
import { syncDesign } from '../utils/syncEngine'
import { useAuthStore } from './authStore'

const STORAGE_KEY = 'funeral-reminder-data'

function loadReminders() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return { customReminders: [], notificationsEnabled: false }
}

function saveReminders(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch { /* ignore */ }
  // Cloud sync
  if (useAuthStore.getState().isLoggedIn()) {
    syncDesign('reminder', 'reminders', data, 'Reminders')
  }
}

export const useReminderStore = create((set, get) => ({
  customReminders: loadReminders().customReminders,
  notificationsEnabled: loadReminders().notificationsEnabled,

  addReminder: (label, date, notifyBefore = 7) => {
    const state = get()
    const reminder = {
      id: `rem-${Date.now()}`,
      label,
      date,
      notifyBefore,
    }
    const updated = [...state.customReminders, reminder]
    set({ customReminders: updated })
    saveReminders({ customReminders: updated, notificationsEnabled: state.notificationsEnabled })
  },

  removeReminder: (id) => {
    const state = get()
    const updated = state.customReminders.filter(r => r.id !== id)
    set({ customReminders: updated })
    saveReminders({ customReminders: updated, notificationsEnabled: state.notificationsEnabled })
  },

  updateReminder: (id, field, value) => {
    const state = get()
    const updated = state.customReminders.map(r => r.id === id ? { ...r, [field]: value } : r)
    set({ customReminders: updated })
    saveReminders({ customReminders: updated, notificationsEnabled: state.notificationsEnabled })
  },

  setNotificationsEnabled: (enabled) => {
    const state = get()
    set({ notificationsEnabled: enabled })
    saveReminders({ customReminders: state.customReminders, notificationsEnabled: enabled })
  },
}))
