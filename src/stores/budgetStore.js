import { create } from 'zustand'
import { syncDesign, deleteDesignFromCloud } from '../utils/syncEngine'
import { useAuthStore } from './authStore'

const STORAGE_KEY = 'funeral-budget-data'
const BUDGETS_KEY = 'funeral-budget-list'

const DEFAULT_CATEGORIES = [
  'Venue', 'Catering', 'Casket/Coffin', 'Transport', 'Printing',
  'Clothing/Fabric', 'Music/Sound', 'Photography/Video',
  'Flowers/Decorations', 'Drinks/Refreshments', 'Church/Mosque Fees', 'Miscellaneous',
]

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

function loadBudgetsList() {
  try {
    const raw = localStorage.getItem(BUDGETS_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return []
}

function saveBudgetsList(list) {
  try {
    localStorage.setItem(BUDGETS_KEY, JSON.stringify(list))
  } catch { /* ignore */ }
}

const defaultBudgetData = {
  eventName: '',
  currency: 'GHS',
  expenses: [],
  contributions: [],
}

export const useBudgetStore = create((set, get) => ({
  ...defaultBudgetData,
  currentId: null,
  isDirty: false,
  budgetsList: loadBudgetsList(),

  updateField: (field, value) => {
    set({ [field]: value, isDirty: true })
  },

  // Expenses
  addExpense: (category) => {
    const state = get()
    const expense = {
      id: `exp-${Date.now()}`,
      category: category || 'Miscellaneous',
      item: '',
      estimated: 0,
      actual: 0,
      paid: false,
      notes: '',
    }
    set({ expenses: [...state.expenses, expense], isDirty: true })
  },

  updateExpense: (id, field, value) => {
    const state = get()
    set({
      expenses: state.expenses.map(e => e.id === id ? { ...e, [field]: value } : e),
      isDirty: true,
    })
  },

  removeExpense: (id) => {
    const state = get()
    set({ expenses: state.expenses.filter(e => e.id !== id), isDirty: true })
  },

  // Contributions
  addContribution: () => {
    const state = get()
    const contribution = {
      id: `con-${Date.now()}`,
      donorName: '',
      amount: 0,
      date: '',
      notes: '',
    }
    set({ contributions: [...state.contributions, contribution], isDirty: true })
  },

  updateContribution: (id, field, value) => {
    const state = get()
    set({
      contributions: state.contributions.map(c => c.id === id ? { ...c, [field]: value } : c),
      isDirty: true,
    })
  },

  removeContribution: (id) => {
    const state = get()
    set({ contributions: state.contributions.filter(c => c.id !== id), isDirty: true })
  },

  // Computed totals (not stored, computed on call)
  getTotals: () => {
    const state = get()
    const totalEstimated = state.expenses.reduce((sum, e) => sum + (Number(e.estimated) || 0), 0)
    const totalActual = state.expenses.reduce((sum, e) => sum + (Number(e.actual) || 0), 0)
    const totalPaid = state.expenses.filter(e => e.paid).reduce((sum, e) => sum + (Number(e.actual) || Number(e.estimated) || 0), 0)
    const totalContributions = state.contributions.reduce((sum, c) => sum + (Number(c.amount) || 0), 0)
    const balance = totalContributions - totalActual
    return { totalEstimated, totalActual, totalPaid, totalContributions, balance }
  },

  getCategoryBreakdown: () => {
    const state = get()
    const breakdown = {}
    for (const cat of DEFAULT_CATEGORIES) {
      const catExpenses = state.expenses.filter(e => e.category === cat)
      breakdown[cat] = {
        estimated: catExpenses.reduce((sum, e) => sum + (Number(e.estimated) || 0), 0),
        actual: catExpenses.reduce((sum, e) => sum + (Number(e.actual) || 0), 0),
        count: catExpenses.length,
      }
    }
    return breakdown
  },

  // Save/Load/Delete
  saveBudget: () => {
    const state = get()
    let id = state.currentId
    if (!id) {
      id = `budget-${Date.now()}`
      set({ currentId: id })
    }
    const data = { eventName: state.eventName, currency: state.currency, expenses: state.expenses, contributions: state.contributions }
    saveToStorage(id, data)

    const list = loadBudgetsList()
    const existing = list.findIndex(p => p.id === id)
    const entry = { id, name: state.eventName || 'Untitled Budget', updatedAt: new Date().toISOString() }
    if (existing >= 0) list[existing] = entry
    else list.push(entry)
    saveBudgetsList(list)
    set({ isDirty: false, budgetsList: list })

    if (useAuthStore.getState().isLoggedIn()) {
      syncDesign('budget', id, data, entry.name, entry.updatedAt)
    }

    return id
  },

  loadBudget: (id) => {
    const data = loadFromStorage(id)
    if (data) set({ ...data, currentId: id, isDirty: false })
  },

  deleteBudget: (id) => {
    try { localStorage.removeItem(`${STORAGE_KEY}-${id}`) } catch { /* ignore */ }
    const list = loadBudgetsList().filter(p => p.id !== id)
    saveBudgetsList(list)
    set({ budgetsList: list })
    deleteDesignFromCloud(id)
  },

  newBudget: () => {
    set({ ...defaultBudgetData, currentId: null, isDirty: false })
  },

  loadFromCloudData: (id, data, name) => {
    saveToStorage(id, data)
    const list = loadBudgetsList()
    if (!list.find(p => p.id === id)) {
      list.push({ id, name: name || 'Untitled Budget', updatedAt: new Date().toISOString() })
      saveBudgetsList(list)
    }
    set({ ...data, currentId: id, isDirty: false, budgetsList: list })
  },

  // Export CSV
  exportCSV: () => {
    const state = get()
    let csv = 'Type,Category/Donor,Item/Notes,Estimated,Actual/Amount,Paid,Date\n'
    for (const e of state.expenses) {
      csv += `Expense,"${e.category}","${e.item}",${e.estimated},${e.actual},${e.paid ? 'Yes' : 'No'},\n`
    }
    for (const c of state.contributions) {
      csv += `Contribution,"${c.donorName}","${c.notes}",,${c.amount},,${c.date}\n`
    }
    return csv
  },
}))

export { DEFAULT_CATEGORIES }
