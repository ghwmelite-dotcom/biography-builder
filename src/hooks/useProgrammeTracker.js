import { useState, useCallback } from 'react'

const STORAGE_KEY = 'programme-tracker-state'

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch { /* ignore */ }
}

export function useProgrammeTracker() {
  const [checked, setChecked] = useState(() => loadState())

  const toggle = useCallback((id) => {
    setChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] }
      saveState(next)
      return next
    })
  }, [])

  const isChecked = useCallback((id) => !!checked[id], [checked])

  const resetAll = useCallback(() => {
    setChecked({})
    saveState({})
  }, [])

  const completedCount = Object.values(checked).filter(Boolean).length

  return { toggle, isChecked, resetAll, completedCount }
}
