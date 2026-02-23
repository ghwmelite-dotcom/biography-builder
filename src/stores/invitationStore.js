import { create } from 'zustand'
import { syncDesign, deleteDesignFromCloud } from '../utils/syncEngine'
import { useAuthStore } from './authStore'
import { invitationDefaultData } from '../utils/invitationDefaultData'

const STORAGE_KEY = 'funeral-invitation-data'
const INVITATIONS_KEY = 'funeral-invitations-list'

function loadFromStorage(id) {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}-${id}`)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return null
}

function saveToStorage(id, data) {
  try {
    localStorage.setItem(`${STORAGE_KEY}-${id}`, JSON.stringify(data))
  } catch { /* ignore */ }
}

function loadInvitationsList() {
  try {
    const raw = localStorage.getItem(INVITATIONS_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return []
}

function saveInvitationsList(list) {
  try {
    localStorage.setItem(INVITATIONS_KEY, JSON.stringify(list))
  } catch { /* ignore */ }
}

const MAX_HISTORY = 30
const MAX_SNAPSHOTS = 5

export const useInvitationStore = create((set, get) => ({
  ...invitationDefaultData,
  currentId: null,
  isDirty: false,

  history: [],
  historyIndex: -1,

  invitationsList: loadInvitationsList(),

  editCountSinceLastSave: 0,
  lastAutoSaveAt: null,
  snapshots: [],

  _pushHistory: () => {
    const state = get()
    const snapshot = extractData(state)
    const history = state.history.slice(0, state.historyIndex + 1)
    history.push(snapshot)
    if (history.length > MAX_HISTORY) history.shift()
    set({ history, historyIndex: history.length - 1 })
  },

  updateField: (field, value) => {
    const state = get()
    state._pushHistory()
    set({ [field]: value, isDirty: true, editCountSinceLastSave: state.editCountSinceLastSave + 1 })
  },

  updateEvent: (index, field, value) => {
    const state = get()
    state._pushHistory()
    const events = [...state.events]
    events[index] = { ...events[index], [field]: value }
    set({
      events,
      isDirty: true,
      editCountSinceLastSave: state.editCountSinceLastSave + 1,
    })
  },

  addEvent: () => {
    const state = get()
    state._pushHistory()
    set({
      events: [...state.events, { date: '', title: '', time: '', venue: '', details: '' }],
      isDirty: true,
    })
  },

  removeEvent: (index) => {
    const state = get()
    if (state.events.length <= 1) return
    state._pushHistory()
    set({
      events: state.events.filter((_, i) => i !== index),
      isDirty: true,
    })
  },

  undo: () => {
    const { history, historyIndex } = get()
    if (historyIndex <= 0) return
    const prev = history[historyIndex - 1]
    set({ ...prev, historyIndex: historyIndex - 1, history, isDirty: true })
  },

  redo: () => {
    const { history, historyIndex } = get()
    if (historyIndex >= history.length - 1) return
    const next = history[historyIndex + 1]
    set({ ...next, historyIndex: historyIndex + 1, history, isDirty: true })
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  createSnapshot: (label) => {
    const state = get()
    const data = extractData(state)
    const snap = {
      id: `snap-${Date.now()}`,
      label: label || 'Manual snapshot',
      timestamp: new Date().toISOString(),
      data,
    }
    const snapshots = [snap, ...state.snapshots].slice(0, MAX_SNAPSHOTS)
    set({ snapshots })
  },

  restoreSnapshot: (id) => {
    const state = get()
    const snap = state.snapshots.find(s => s.id === id)
    if (snap) {
      set({ ...snap.data, isDirty: true, history: [], historyIndex: -1 })
    }
  },

  deleteSnapshot: (id) => {
    set({ snapshots: get().snapshots.filter(s => s.id !== id) })
  },

  getSmartFilename: (ext) => {
    const state = get()
    const name = state.fullName?.trim()
    if (name) {
      return `${name.replace(/\s+/g, '-')}-Funeral-Invitation.${ext}`
    }
    return `Funeral-Invitation.${ext}`
  },

  saveInvitation: () => {
    const state = get()
    let id = state.currentId
    if (!id) {
      id = `invitation-${Date.now()}`
      set({ currentId: id })
    }
    const data = extractData(state)
    saveToStorage(id, data)

    const list = loadInvitationsList()
    const existing = list.findIndex((p) => p.id === id)
    const entry = {
      id,
      name: `${state.title} ${state.fullName}`.trim(),
      updatedAt: new Date().toISOString(),
    }
    if (existing >= 0) {
      list[existing] = entry
    } else {
      list.push(entry)
    }
    saveInvitationsList(list)
    set({ isDirty: false, invitationsList: list, editCountSinceLastSave: 0, lastAutoSaveAt: new Date().toISOString() })

    if (useAuthStore.getState().isLoggedIn()) {
      syncDesign('invitation', id, data, entry.name, entry.updatedAt)
    }

    return id
  },

  loadInvitation: (id) => {
    const data = loadFromStorage(id)
    if (data) {
      set({ ...data, currentId: id, isDirty: false, history: [], historyIndex: -1 })
    }
  },

  deleteInvitation: (id) => {
    try { localStorage.removeItem(`${STORAGE_KEY}-${id}`) } catch { /* ignore */ }
    const list = loadInvitationsList().filter((p) => p.id !== id)
    saveInvitationsList(list)
    set({ invitationsList: list })
    deleteDesignFromCloud(id)
  },

  newInvitation: () => {
    set({
      ...invitationDefaultData,
      currentId: null,
      isDirty: false,
      history: [],
      historyIndex: -1,
      editCountSinceLastSave: 0,
      lastAutoSaveAt: null,
    })
  },

  loadFromCloudData: (id, data, name) => {
    saveToStorage(id, data)
    const list = loadInvitationsList()
    if (!list.find((p) => p.id === id)) {
      list.push({ id, name, updatedAt: new Date().toISOString() })
      saveInvitationsList(list)
    }
    set({ ...data, currentId: id, isDirty: false, invitationsList: list, history: [], historyIndex: -1 })
  },

  loadTemplate: (data) => {
    set({
      ...invitationDefaultData,
      ...data,
      currentId: null,
      isDirty: false,
      history: [],
      historyIndex: -1,
      editCountSinceLastSave: 0,
      lastAutoSaveAt: null,
    })
  },

  exportJSON: () => {
    const data = extractData(get())
    return JSON.stringify(data, null, 2)
  },

  importJSON: (jsonStr) => {
    try {
      const data = JSON.parse(jsonStr)
      return data
    } catch {
      return false
    }
  },

  applyImport: (data) => {
    set({ ...data, isDirty: true, history: [], historyIndex: -1 })
  },
}))

function extractData(state) {
  const {
    currentId, isDirty, history, historyIndex, invitationsList,
    editCountSinceLastSave, lastAutoSaveAt, snapshots,
    _pushHistory, updateField, updateEvent, addEvent, removeEvent,
    undo, redo, canUndo, canRedo,
    saveInvitation, loadInvitation, deleteInvitation, newInvitation, loadFromCloudData, loadTemplate,
    exportJSON, importJSON, applyImport,
    createSnapshot, restoreSnapshot, deleteSnapshot,
    getSmartFilename,
    ...data
  } = state
  return data
}
