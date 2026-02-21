import { useState } from 'react'
import { Save, X } from 'lucide-react'
import { useBrochureStore } from '../../stores/brochureStore'

export function BackupReminder() {
  const editCount = useBrochureStore(s => s.editCountSinceLastSave)
  const saveBrochure = useBrochureStore(s => s.saveBrochure)
  const [dismissed, setDismissed] = useState(false)

  if (dismissed || editCount < 5) return null

  return (
    <div className="mx-4 mt-2 px-3 py-2 bg-amber-900/30 border border-amber-700/50 rounded-lg flex items-center gap-2 text-xs text-amber-300">
      <Save size={14} className="shrink-0" />
      <span className="flex-1">You have unsaved changes. Don't forget to save!</span>
      <button onClick={() => { saveBrochure(); setDismissed(true) }} className="px-2 py-1 bg-amber-600 text-white rounded text-xs hover:bg-amber-500">Save Now</button>
      <button onClick={() => setDismissed(true)} className="text-amber-500 hover:text-amber-400"><X size={14} /></button>
    </div>
  )
}
