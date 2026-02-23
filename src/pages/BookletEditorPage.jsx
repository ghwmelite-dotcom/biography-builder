import { useEffect } from 'react'
import BookletNavbar from '../components/layout/BookletNavbar'
import BookletEditorLayout from '../components/layout/BookletEditorLayout'
import { useBookletStore } from '../stores/bookletStore'

export default function BookletEditorPage() {
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = e.target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
        if (e.ctrlKey && e.key === 's') {
          e.preventDefault()
          useBookletStore.getState().saveBooklet()
        }
        return
      }
      if (e.ctrlKey && !e.shiftKey && e.key === 's') {
        e.preventDefault()
        useBookletStore.getState().saveBooklet()
        return
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'Z') {
        e.preventDefault()
        useBookletStore.getState().redo()
        return
      }
      if (e.ctrlKey && !e.shiftKey && e.key === 'z') {
        e.preventDefault()
        useBookletStore.getState().undo()
        return
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="h-screen flex flex-col bg-background">
      <BookletNavbar />
      <BookletEditorLayout />
    </div>
  )
}
