import { Plus, Trash2 } from 'lucide-react'
import { usePosterStore } from '../../stores/posterStore'

export default function PosterFuneralForm() {
  const store = usePosterStore()
  const items = store.funeralArrangements
  const inputClass = 'w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-600 placeholder:text-zinc-600'

  return (
    <div className="space-y-3">
      <p className="text-[10px] text-zinc-500">Add each funeral event with a label (e.g. "BURIAL SERVICE") and details (date, time, venue).</p>

      {items.map((item, i) => (
        <div key={i} className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg space-y-2">
          <div className="flex items-start gap-2">
            <div className="flex-1 space-y-2">
              <input
                type="text"
                value={item.label}
                onChange={(e) => store.updateFuneralArrangement(i, 'label', e.target.value)}
                placeholder="Event label, e.g. BURIAL SERVICE"
                className={inputClass}
              />
              <textarea
                value={item.value}
                onChange={(e) => store.updateFuneralArrangement(i, 'value', e.target.value)}
                rows={2}
                placeholder="Date, time, and venue details..."
                className={inputClass}
              />
            </div>
            {items.length > 1 && (
              <button onClick={() => store.removeFuneralArrangement(i)} className="p-1.5 text-zinc-600 hover:text-red-400 transition-colors mt-1">
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
      ))}

      <button
        onClick={() => store.addFuneralArrangement()}
        className="flex items-center gap-1.5 text-xs text-amber-500 hover:text-amber-400 transition-colors"
      >
        <Plus size={14} /> Add Arrangement
      </button>
    </div>
  )
}
