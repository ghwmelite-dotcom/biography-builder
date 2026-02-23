import { useBookletStore } from '../../stores/bookletStore'
import { bookletThemes } from '../../utils/bookletDefaultData'

export default function BookletBackForm() {
  const store = useBookletStore()
  const inputClass = 'w-full bg-card border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/60'

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-muted-foreground mb-1">Officiant</label>
        <input type="text" value={store.officiant} onChange={(e) => store.updateField('officiant', e.target.value)} placeholder="e.g. Rev. Dr. John Mensah" className={inputClass} />
      </div>
      <div>
        <label className="block text-xs text-muted-foreground mb-1">Church / Mosque Name</label>
        <input type="text" value={store.churchName} onChange={(e) => store.updateField('churchName', e.target.value)} placeholder="e.g. Trinity Anglican Church" className={inputClass} />
      </div>
      <div>
        <label className="block text-xs text-muted-foreground mb-1">Back Cover Text <span className="text-muted-foreground/60">(Optional)</span></label>
        <textarea
          value={store.customBackText}
          onChange={(e) => store.updateField('customBackText', e.target.value)}
          placeholder="Optional text for the back cover..."
          rows={3}
          className={inputClass}
        />
      </div>

      {/* Theme selector */}
      <div>
        <label className="block text-xs text-muted-foreground mb-2">Booklet Theme</label>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(bookletThemes).map(([key, t]) => (
            <button
              key={key}
              onClick={() => store.updateField('bookletTheme', key)}
              className={`p-3 rounded-lg border text-left transition-all ${
                store.bookletTheme === key
                  ? 'border-primary bg-primary/10 ring-1 ring-primary/30'
                  : 'border-input bg-card hover:border-muted-foreground'
              }`}
            >
              <div className="flex gap-1 mb-1.5">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: t.headerBg, border: '1px solid #444' }} />
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: t.accent }} />
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: t.detailsBg, border: '1px solid #444' }} />
              </div>
              <div className="text-xs font-medium text-card-foreground">{t.name}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
