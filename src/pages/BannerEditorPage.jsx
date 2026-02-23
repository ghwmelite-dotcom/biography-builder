import { useEffect } from 'react'
import BannerNavbar from '../components/layout/BannerNavbar'
import BannerEditorLayout from '../components/layout/BannerEditorLayout'
import { useBannerStore } from '../stores/bannerStore'

export default function BannerEditorPage() {
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = e.target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
        if (e.ctrlKey && e.key === 's') {
          e.preventDefault()
          useBannerStore.getState().saveBanner()
        }
        return
      }
      if (e.ctrlKey && !e.shiftKey && e.key === 's') {
        e.preventDefault()
        useBannerStore.getState().saveBanner()
        return
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'Z') {
        e.preventDefault()
        useBannerStore.getState().redo()
        return
      }
      if (e.ctrlKey && !e.shiftKey && e.key === 'z') {
        e.preventDefault()
        useBannerStore.getState().undo()
        return
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="h-screen flex flex-col bg-background">
      <BannerNavbar />
      <BannerEditorLayout />
    </div>
  )
}
