import { Link, useLocation } from 'react-router-dom'
import { BookOpen, Undo2, Redo2, Save, Download, Upload } from 'lucide-react'
import { useBrochureStore } from '../../stores/brochureStore'
import { useRef } from 'react'

export default function Navbar() {
  const location = useLocation()
  const store = useBrochureStore()
  const fileInputRef = useRef(null)
  const isEditor = location.pathname.startsWith('/editor')

  const handleExport = () => {
    const json = store.exportJSON()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `brochure-${store.fullName?.replace(/\s+/g, '-') || 'data'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const ok = store.importJSON(ev.target.result)
      if (!ok) alert('Invalid brochure data file.')
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <nav className="h-12 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-4 shrink-0">
      <Link to="/" className="flex items-center gap-2 text-zinc-300 hover:text-white transition-colors">
        <BookOpen size={18} className="text-amber-500" />
        <span className="text-sm font-semibold tracking-wide">Brochure Builder</span>
      </Link>

      {isEditor && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => store.undo()}
            disabled={!store.canUndo()}
            className="p-2 text-zinc-500 hover:text-zinc-300 disabled:opacity-30 transition-colors"
            title="Undo"
          >
            <Undo2 size={15} />
          </button>
          <button
            onClick={() => store.redo()}
            disabled={!store.canRedo()}
            className="p-2 text-zinc-500 hover:text-zinc-300 disabled:opacity-30 transition-colors"
            title="Redo"
          >
            <Redo2 size={15} />
          </button>

          <div className="w-px h-5 bg-zinc-700 mx-2" />

          <button
            onClick={() => store.saveBrochure()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Save"
          >
            <Save size={14} />
            <span className="hidden sm:inline">Save</span>
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Export JSON"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Import JSON"
          >
            <Upload size={14} />
            <span className="hidden sm:inline">Import</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />

          {store.isDirty && (
            <span className="text-[10px] text-amber-600 ml-2">Unsaved</span>
          )}
        </div>
      )}
    </nav>
  )
}
