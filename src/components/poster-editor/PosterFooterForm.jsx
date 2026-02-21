import { usePosterStore } from '../../stores/posterStore'
import { posterThemes } from '../../utils/posterDefaultData'

export default function PosterFooterForm() {
  const store = usePosterStore()
  const inputClass = 'w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-600 placeholder:text-zinc-600'

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-zinc-400 mb-1">Invitation Text</label>
        <input type="text" value={store.invitationText} onChange={(e) => store.updateField('invitationText', e.target.value)} className={inputClass} />
      </div>

      <div>
        <label className="block text-xs text-zinc-400 mb-1">Dress Code</label>
        <input type="text" value={store.dressCode} onChange={(e) => store.updateField('dressCode', e.target.value)} placeholder="e.g. BLACK & WHITE" className={inputClass} />
      </div>

      {/* Theme Selector */}
      <div>
        <label className="block text-xs text-zinc-400 mb-2">Poster Theme</label>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(posterThemes).map(([key, t]) => (
            <button
              key={key}
              onClick={() => store.updateField('posterTheme', key)}
              className={`p-3 rounded-lg border text-left transition-all ${
                store.posterTheme === key
                  ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/30'
                  : 'border-zinc-700 bg-zinc-900 hover:border-zinc-500'
              }`}
            >
              <div className="flex gap-1 mb-1.5">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: t.headerBg, border: '1px solid #444' }} />
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: t.accent }} />
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: t.detailsBg, border: '1px solid #444' }} />
              </div>
              <div className="text-xs font-medium text-zinc-300">{t.name}</div>
              <div className="text-[10px] text-zinc-500">{t.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
