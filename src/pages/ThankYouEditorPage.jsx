import { useEffect } from 'react'
import ThankYouNavbar from '../components/layout/ThankYouNavbar'
import ThankYouEditorLayout from '../components/layout/ThankYouEditorLayout'
import { useThankYouStore } from '../stores/thankYouStore'

export default function ThankYouEditorPage() {
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = e.target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
        if (e.ctrlKey && e.key === 's') {
          e.preventDefault()
          useThankYouStore.getState().saveThankYou()
        }
        return
      }
      if (e.ctrlKey && !e.shiftKey && e.key === 's') {
        e.preventDefault()
        useThankYouStore.getState().saveThankYou()
        return
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'Z') {
        e.preventDefault()
        useThankYouStore.getState().redo()
        return
      }
      if (e.ctrlKey && !e.shiftKey && e.key === 'z') {
        e.preventDefault()
        useThankYouStore.getState().undo()
        return
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="h-screen flex flex-col bg-background">
      <ThankYouNavbar />
      <ThankYouEditorLayout />
    </div>
  )
}
