import { useEffect } from 'react'
import InvitationNavbar from '../components/layout/InvitationNavbar'
import InvitationEditorLayout from '../components/layout/InvitationEditorLayout'
import { useInvitationStore } from '../stores/invitationStore'

export default function InvitationEditorPage() {
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = e.target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
        if (e.ctrlKey && e.key === 's') {
          e.preventDefault()
          useInvitationStore.getState().saveInvitation()
        }
        return
      }
      if (e.ctrlKey && !e.shiftKey && e.key === 's') {
        e.preventDefault()
        useInvitationStore.getState().saveInvitation()
        return
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'Z') {
        e.preventDefault()
        useInvitationStore.getState().redo()
        return
      }
      if (e.ctrlKey && !e.shiftKey && e.key === 'z') {
        e.preventDefault()
        useInvitationStore.getState().undo()
        return
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="h-screen flex flex-col bg-background">
      <InvitationNavbar />
      <InvitationEditorLayout />
    </div>
  )
}
