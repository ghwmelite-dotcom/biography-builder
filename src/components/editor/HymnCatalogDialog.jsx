import { useState } from 'react'
import { Music, Search } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog'
import { hymns, hymnCategories, getHymnsByCategory } from '../../utils/hymnCatalog'

export default function HymnCatalogDialog({ open, onOpenChange, onSelect }) {
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = getHymnsByCategory(category).filter(
    (h) =>
      !search ||
      h.title.toLowerCase().includes(search.toLowerCase()) ||
      h.firstLine.toLowerCase().includes(search.toLowerCase()) ||
      h.author.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Browse Hymns</DialogTitle>
          <DialogDescription>Select a hymn to add to the order of service.</DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search hymns..."
            className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
          />
        </div>

        {/* Category tabs */}
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => setCategory('all')}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              category === 'all'
                ? 'bg-amber-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All
          </button>
          {Object.entries(hymnCategories).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setCategory(key)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                category === key
                  ? 'bg-amber-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Hymn list */}
        <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
          {filtered.map((hymn) => (
            <button
              key={hymn.id}
              onClick={() => {
                onSelect(hymn)
                onOpenChange(false)
              }}
              className="w-full text-left p-3 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-amber-600/50 hover:bg-zinc-800/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Music size={14} className="text-amber-500/60 shrink-0" />
                <div>
                  <p className="text-sm text-zinc-200">{hymn.title}</p>
                  <p className="text-[10px] text-zinc-500">
                    {hymn.author} &middot; {hymn.firstLine}
                  </p>
                </div>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-zinc-500 text-center py-4">No hymns found.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
