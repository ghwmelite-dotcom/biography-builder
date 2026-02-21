import { useEffect, useRef } from 'react'
import { useBrochureStore } from '../stores/brochureStore'

export function useAutoSave(intervalMs = 30000) {
  const isDirty = useBrochureStore((s) => s.isDirty)
  const saveBrochure = useBrochureStore((s) => s.saveBrochure)
  const timerRef = useRef(null)

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current)

    timerRef.current = setInterval(() => {
      if (useBrochureStore.getState().isDirty) {
        saveBrochure()
      }
    }, intervalMs)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [intervalMs, saveBrochure])

  // Also save on unmount if dirty
  useEffect(() => {
    return () => {
      if (useBrochureStore.getState().isDirty) {
        saveBrochure()
      }
    }
  }, [saveBrochure])
}
