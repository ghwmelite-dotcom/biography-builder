import { useBrochureStore } from '../../stores/brochureStore'
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'

export default function TributesForm() {
  const store = useBrochureStore()
  const [expandedIndex, setExpandedIndex] = useState(0)

  return (
    <div className="space-y-2">
      {store.tributes.map((tribute, i) => (
        <div key={tribute.id} className="border border-zinc-700 rounded-lg overflow-hidden">
          {/* Accordion header */}
          <button
            onClick={() => setExpandedIndex(expandedIndex === i ? -1 : i)}
            className="w-full flex items-center justify-between px-3 py-2.5 bg-zinc-900 hover:bg-zinc-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              {expandedIndex === i ? <ChevronDown size={14} className="text-zinc-500" /> : <ChevronRight size={14} className="text-zinc-500" />}
              <span className="text-sm text-zinc-300">{tribute.title || `Tribute ${i + 1}`}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (confirm('Remove this tribute section?')) store.removeTribute(i)
              }}
              className="p-1 text-zinc-600 hover:text-red-400 transition-colors"
            >
              <Trash2 size={12} />
            </button>
          </button>

          {/* Accordion content */}
          {expandedIndex === i && (
            <div className="p-3 space-y-3 bg-zinc-900/50">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Tribute Title</label>
                <input
                  type="text"
                  value={tribute.title}
                  onChange={(e) => store.updateTribute(i, 'title', e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={tribute.subtitle}
                  onChange={(e) => store.updateTribute(i, 'subtitle', e.target.value)}
                  placeholder="e.g. To Our Beloved Mother"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">Opening Verse</label>
                <textarea
                  value={tribute.openingVerse}
                  onChange={(e) => store.updateTribute(i, 'openingVerse', e.target.value)}
                  rows={2}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-600 resize-none"
                  placeholder={`"Her children arise and call her blessed." — Proverbs 31:28`}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-zinc-400">Tribute Body</label>
                  <span className="text-[10px] text-zinc-600">
                    {(tribute.body || '').split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>
                <textarea
                  value={tribute.body}
                  onChange={(e) => store.updateTribute(i, 'body', e.target.value)}
                  rows={8}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-600 resize-none leading-relaxed"
                  placeholder="Write the tribute text..."
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">Closing Line</label>
                <input
                  type="text"
                  value={tribute.closingLine}
                  onChange={(e) => store.updateTribute(i, 'closingLine', e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-600"
                />
              </div>
            </div>
          )}
        </div>
      ))}

      <button
        onClick={() => store.addTribute()}
        className="flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-500 transition-colors mt-2"
      >
        <Plus size={14} /> Add Tribute Section
      </button>
    </div>
  )
}
