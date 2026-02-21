import { create } from 'zustand'
import { defaultData } from '../utils/defaultData'

const STORAGE_KEY = 'funeral-brochure-data'
const BROCHURES_KEY = 'funeral-brochures-list'

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

function loadBrochuresList() {
  try {
    const raw = localStorage.getItem(BROCHURES_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return []
}

function saveBrochuresList(list) {
  try {
    localStorage.setItem(BROCHURES_KEY, JSON.stringify(list))
  } catch { /* ignore */ }
}

const MAX_HISTORY = 30

export const useBrochureStore = create((set, get) => ({
  // Current brochure data
  ...defaultData,
  currentId: null,
  isDirty: false,

  // History for undo/redo
  history: [],
  historyIndex: -1,

  // Brochures list
  brochuresList: loadBrochuresList(),

  // Push state for undo
  _pushHistory: () => {
    const state = get()
    const snapshot = extractData(state)
    const history = state.history.slice(0, state.historyIndex + 1)
    history.push(snapshot)
    if (history.length > MAX_HISTORY) history.shift()
    set({ history, historyIndex: history.length - 1 })
  },

  // Update a field
  updateField: (field, value) => {
    const state = get()
    state._pushHistory()
    set({ [field]: value, isDirty: true })
  },

  // Update nested fields
  updateNested: (path, value) => {
    const state = get()
    state._pushHistory()
    const parts = path.split('.')
    if (parts.length === 2) {
      const [parent, child] = parts
      set({
        [parent]: { ...state[parent], [child]: value },
        isDirty: true,
      })
    }
  },

  // Update order of service
  updateServiceItem: (section, index, field, value) => {
    const state = get()
    state._pushHistory()
    const items = [...state.orderOfService[section]]
    items[index] = { ...items[index], [field]: value }
    set({
      orderOfService: { ...state.orderOfService, [section]: items },
      isDirty: true,
    })
  },

  addServiceItem: (section) => {
    const state = get()
    state._pushHistory()
    const items = [...state.orderOfService[section], { time: '', description: '' }]
    set({
      orderOfService: { ...state.orderOfService, [section]: items },
      isDirty: true,
    })
  },

  removeServiceItem: (section, index) => {
    const state = get()
    state._pushHistory()
    const items = state.orderOfService[section].filter((_, i) => i !== index)
    set({
      orderOfService: { ...state.orderOfService, [section]: items },
      isDirty: true,
    })
  },

  moveServiceItem: (section, from, to) => {
    const state = get()
    state._pushHistory()
    const items = [...state.orderOfService[section]]
    const [moved] = items.splice(from, 1)
    items.splice(to, 0, moved)
    set({
      orderOfService: { ...state.orderOfService, [section]: items },
      isDirty: true,
    })
  },

  // Update tributes
  updateTribute: (index, field, value) => {
    const state = get()
    state._pushHistory()
    const tributes = [...state.tributes]
    tributes[index] = { ...tributes[index], [field]: value }
    set({ tributes, isDirty: true })
  },

  addTribute: () => {
    const state = get()
    state._pushHistory()
    set({
      tributes: [
        ...state.tributes,
        {
          id: `trib-${Date.now()}`,
          title: 'New Tribute',
          subtitle: '',
          openingVerse: '',
          body: '',
          closingLine: 'Rest in Perfect Peace',
        },
      ],
      isDirty: true,
    })
  },

  removeTribute: (index) => {
    const state = get()
    state._pushHistory()
    set({
      tributes: state.tributes.filter((_, i) => i !== index),
      isDirty: true,
    })
  },

  // Update officials
  updateOfficial: (section, index, field, value) => {
    const state = get()
    state._pushHistory()
    const list = [...state.officials[section]]
    list[index] = { ...list[index], [field]: value }
    set({
      officials: { ...state.officials, [section]: list },
      isDirty: true,
    })
  },

  addOfficial: (section) => {
    const state = get()
    state._pushHistory()
    set({
      officials: {
        ...state.officials,
        [section]: [...state.officials[section], { role: '', name: '' }],
      },
      isDirty: true,
    })
  },

  removeOfficial: (section, index) => {
    const state = get()
    state._pushHistory()
    set({
      officials: {
        ...state.officials,
        [section]: state.officials[section].filter((_, i) => i !== index),
      },
      isDirty: true,
    })
  },

  // Gallery photos
  updateGalleryPhoto: (index, field, value) => {
    const state = get()
    const photos = [...state.galleryPhotos]
    photos[index] = { ...photos[index], [field]: value }
    set({ galleryPhotos: photos, isDirty: true })
  },

  addGalleryPhoto: () => {
    const state = get()
    set({
      galleryPhotos: [
        ...state.galleryPhotos,
        { id: `photo-${Date.now()}`, src: null, caption: '', pageTitle: 'More Memories' },
      ],
      isDirty: true,
    })
  },

  removeGalleryPhoto: (index) => {
    const state = get()
    set({
      galleryPhotos: state.galleryPhotos.filter((_, i) => i !== index),
      isDirty: true,
    })
  },

  // Biography photos
  updateBiographyPhoto: (index, src) => {
    const state = get()
    const photos = [...state.biographyPhotos]
    photos[index] = src
    set({ biographyPhotos: photos, isDirty: true })
  },

  updateBiographyCaption: (index, caption) => {
    const state = get()
    const captions = [...state.biographyPhotoCaptions]
    captions[index] = caption
    set({ biographyPhotoCaptions: captions, isDirty: true })
  },

  // Undo/Redo
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

  // Save / Load
  saveBrochure: () => {
    const state = get()
    let id = state.currentId
    if (!id) {
      id = `brochure-${Date.now()}`
      set({ currentId: id })
    }
    const data = extractData(state)
    saveToStorage(id, data)

    const list = loadBrochuresList()
    const existing = list.findIndex((b) => b.id === id)
    const entry = {
      id,
      name: `${state.title} ${state.fullName}`,
      updatedAt: new Date().toISOString(),
    }
    if (existing >= 0) {
      list[existing] = entry
    } else {
      list.push(entry)
    }
    saveBrochuresList(list)
    set({ isDirty: false, brochuresList: list })
    return id
  },

  loadBrochure: (id) => {
    const data = loadFromStorage(id)
    if (data) {
      set({ ...data, currentId: id, isDirty: false, history: [], historyIndex: -1 })
    }
  },

  deleteBrochure: (id) => {
    try { localStorage.removeItem(`${STORAGE_KEY}-${id}`) } catch { /* ignore */ }
    const list = loadBrochuresList().filter((b) => b.id !== id)
    saveBrochuresList(list)
    set({ brochuresList: list })
  },

  newBrochure: () => {
    set({
      ...defaultData,
      currentId: null,
      isDirty: false,
      history: [],
      historyIndex: -1,
    })
  },

  // Export/Import JSON
  exportJSON: () => {
    const data = extractData(get())
    return JSON.stringify(data, null, 2)
  },

  importJSON: (jsonStr) => {
    try {
      const data = JSON.parse(jsonStr)
      set({ ...data, isDirty: true, history: [], historyIndex: -1 })
      return true
    } catch {
      return false
    }
  },
}))

function extractData(state) {
  const {
    currentId, isDirty, history, historyIndex, brochuresList,
    _pushHistory, updateField, updateNested, updateServiceItem,
    addServiceItem, removeServiceItem, moveServiceItem,
    updateTribute, addTribute, removeTribute,
    updateOfficial, addOfficial, removeOfficial,
    updateGalleryPhoto, addGalleryPhoto, removeGalleryPhoto,
    updateBiographyPhoto, updateBiographyCaption,
    undo, redo, canUndo, canRedo,
    saveBrochure, loadBrochure, deleteBrochure, newBrochure,
    exportJSON, importJSON,
    ...data
  } = state
  return data
}
