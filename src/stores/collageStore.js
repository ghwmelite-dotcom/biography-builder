import { create } from 'zustand'
import { syncDesign, deleteDesignFromCloud } from '../utils/syncEngine'
import { useAuthStore } from './authStore'

const STORAGE_KEY = 'funeral-collage-data'
const COLLAGES_KEY = 'funeral-collage-list'

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

function loadCollagesList() {
  try {
    const raw = localStorage.getItem(COLLAGES_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return []
}

function saveCollagesList(list) {
  try {
    localStorage.setItem(COLLAGES_KEY, JSON.stringify(list))
  } catch { /* ignore */ }
}

export const COLLAGE_TEMPLATES = {
  'grid-2x2': { name: '2×2 Grid', cols: 2, rows: 2, cells: 4, icon: 'grid' },
  'grid-3x3': { name: '3×3 Grid', cols: 3, rows: 3, cells: 9, icon: 'grid' },
  'two-column': { name: '2 Column', cols: 2, rows: 3, cells: 6, icon: 'columns' },
  'heart': { name: 'Heart Shape', cols: 3, rows: 3, cells: 9, icon: 'heart', shape: 'heart' },
  'cross': { name: 'Cross Shape', cols: 3, rows: 3, cells: 5, icon: 'cross', shape: 'cross' },
  'circle': { name: 'Circle Frame', cols: 1, rows: 1, cells: 1, icon: 'circle', shape: 'circle' },
  'diamond': { name: 'Diamond Grid', cols: 2, rows: 3, cells: 6, icon: 'diamond', shape: 'diamond' },
}

function generateCells(templateId) {
  const template = COLLAGE_TEMPLATES[templateId]
  if (!template) return []
  return Array.from({ length: template.cells }, (_, i) => ({
    id: `cell-${i}`,
    photo: null,
    caption: '',
  }))
}

const defaultCollageData = {
  templateId: 'grid-2x2',
  name: '',
  dates: '',
  cells: generateCells('grid-2x2'),
  showOverlay: true,
  overlayPosition: 'bottom',
  backgroundColor: '#0A0A0A',
  overlayColor: '#FFFFFF',
  borderColor: '#C9A84C',
  borderWidth: 2,
  cellGap: 4,
}

export const useCollageStore = create((set, get) => ({
  ...defaultCollageData,
  currentId: null,
  isDirty: false,
  collagesList: loadCollagesList(),

  updateField: (field, value) => {
    set({ [field]: value, isDirty: true })
  },

  setTemplate: (templateId) => {
    set({
      templateId,
      cells: generateCells(templateId),
      isDirty: true,
    })
  },

  updateCell: (cellId, field, value) => {
    const state = get()
    set({
      cells: state.cells.map(c => c.id === cellId ? { ...c, [field]: value } : c),
      isDirty: true,
    })
  },

  setCellPhoto: (cellId, photoDataUrl) => {
    const state = get()
    set({
      cells: state.cells.map(c => c.id === cellId ? { ...c, photo: photoDataUrl } : c),
      isDirty: true,
    })
  },

  removeCellPhoto: (cellId) => {
    const state = get()
    set({
      cells: state.cells.map(c => c.id === cellId ? { ...c, photo: null } : c),
      isDirty: true,
    })
  },

  saveCollage: () => {
    const state = get()
    let id = state.currentId
    if (!id) {
      id = `collage-${Date.now()}`
      set({ currentId: id })
    }
    const data = extractData(state)
    saveToStorage(id, data)

    const list = loadCollagesList()
    const existing = list.findIndex(p => p.id === id)
    const entry = { id, name: state.name || 'Untitled Collage', updatedAt: new Date().toISOString() }
    if (existing >= 0) list[existing] = entry
    else list.push(entry)
    saveCollagesList(list)
    set({ isDirty: false, collagesList: list })

    if (useAuthStore.getState().isLoggedIn()) {
      syncDesign('collage', id, data, entry.name, entry.updatedAt)
    }

    return id
  },

  loadCollage: (id) => {
    const data = loadFromStorage(id)
    if (data) set({ ...data, currentId: id, isDirty: false })
  },

  deleteCollage: (id) => {
    try { localStorage.removeItem(`${STORAGE_KEY}-${id}`) } catch { /* ignore */ }
    const list = loadCollagesList().filter(p => p.id !== id)
    saveCollagesList(list)
    set({ collagesList: list })
    deleteDesignFromCloud(id)
  },

  newCollage: () => {
    set({ ...defaultCollageData, currentId: null, isDirty: false })
  },

  loadFromCloudData: (id, data, name) => {
    saveToStorage(id, data)
    const list = loadCollagesList()
    if (!list.find(p => p.id === id)) {
      list.push({ id, name: name || 'Untitled Collage', updatedAt: new Date().toISOString() })
      saveCollagesList(list)
    }
    set({ ...data, currentId: id, isDirty: false, collagesList: list })
  },
}))

function extractData(state) {
  const { currentId, isDirty, collagesList, updateField, setTemplate, updateCell, setCellPhoto, removeCellPhoto, saveCollage, loadCollage, deleteCollage, newCollage, loadFromCloudData, ...data } = state
  return data
}
