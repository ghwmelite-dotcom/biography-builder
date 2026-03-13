import { create } from 'zustand'
import { syncDesign, deleteDesignFromCloud } from '../utils/syncEngine'
import { useAuthStore } from './authStore'
import { thankYouDefaultData } from '../utils/thankYouDefaultData'

const STORAGE_KEY = 'funeral-thankyou-data'
const LIST_KEY = 'funeral-thankyou-list'

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

function loadThankYouList() {
  try {
    const raw = localStorage.getItem(LIST_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return []
}

function saveThankYouList(list) {
  try {
    localStorage.setItem(LIST_KEY, JSON.stringify(list))
  } catch { /* ignore */ }
}

const MAX_HISTORY = 30
const MAX_SNAPSHOTS = 5

export const useThankYouStore = create((set, get) => ({
  ...thankYouDefaultData,
  currentId: null,
  isDirty: false,

  history: [],
  historyIndex: -1,

  thankYouList: loadThankYouList(),

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
      return `${name.replace(/\s+/g, '-')}-Thank-You-Card.${ext}`
    }
    return `Thank-You-Card.${ext}`
  },

  saveThankYou: () => {
    const state = get()
    let id = state.currentId
    if (!id) {
      id = `thankyou-${Date.now()}`
      set({ currentId: id })
    }
    const data = extractData(state)
    saveToStorage(id, data)

    const list = loadThankYouList()
    const existing = list.findIndex((p) => p.id === id)
    const entry = {
      id,
      name: `Thank You ${state.fullName}`.trim(),
      updatedAt: new Date().toISOString(),
    }
    if (existing >= 0) {
      list[existing] = entry
    } else {
      list.push(entry)
    }
    saveThankYouList(list)
    set({ isDirty: false, thankYouList: list, editCountSinceLastSave: 0, lastAutoSaveAt: new Date().toISOString() })

    if (useAuthStore.getState().isLoggedIn()) {
      syncDesign('thankYou', id, data, entry.name, entry.updatedAt)
    }

    return id
  },

  loadThankYou: (id) => {
    const data = loadFromStorage(id)
    if (data) {
      set({ ...data, currentId: id, isDirty: false, history: [], historyIndex: -1 })
    }
  },

  deleteThankYou: (id) => {
    try { localStorage.removeItem(`${STORAGE_KEY}-${id}`) } catch { /* ignore */ }
    const list = loadThankYouList().filter((p) => p.id !== id)
    saveThankYouList(list)
    set({ thankYouList: list })
    deleteDesignFromCloud(id)
  },

  newThankYou: () => {
    set({
      ...thankYouDefaultData,
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
    const list = loadThankYouList()
    if (!list.find((p) => p.id === id)) {
      list.push({ id, name, updatedAt: new Date().toISOString() })
      saveThankYouList(list)
    }
    set({ ...data, currentId: id, isDirty: false, thankYouList: list, history: [], historyIndex: -1 })
  },

  loadTemplate: (data) => {
    set({
      ...thankYouDefaultData,
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

const EXTRACT_EXCLUDE = new Set([
  'currentId', 'isDirty', 'history', 'historyIndex', 'thankYouList',
  'editCountSinceLastSave', 'lastAutoSaveAt', 'snapshots',
  '_pushHistory', 'updateField',
  'undo', 'redo', 'canUndo', 'canRedo',
  'saveThankYou', 'loadThankYou', 'deleteThankYou', 'newThankYou', 'loadFromCloudData', 'loadTemplate',
  'exportJSON', 'importJSON', 'applyImport',
  'createSnapshot', 'restoreSnapshot', 'deleteSnapshot',
  'getSmartFilename',
])

function extractData(state) {
  return Object.fromEntries(Object.entries(state).filter(([k]) => !EXTRACT_EXCLUDE.has(k)))
}
