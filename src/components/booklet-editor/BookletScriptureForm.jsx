import { useBookletStore } from '../../stores/bookletStore'
import { defaultScriptures } from '../../utils/defaultData'

export default function BookletScriptureForm() {
  const store = useBookletStore()
  const inputClass = 'w-full bg-card border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/60'

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-muted-foreground mb-1">Select a Scripture</label>
        <select value={store.scriptureKey} onChange={(e) => store.updateField('scriptureKey', e.target.value)} className={inputClass}>
          <option value="">— Choose a scripture —</option>
          {Object.entries(defaultScriptures).map(([key, s]) => (
            <option key={key} value={key}>{s.title} — {s.subtitle}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs text-muted-foreground mb-1">Or Write Custom Scripture</label>
        <textarea
          value={store.customScripture}
          onChange={(e) => store.updateField('customScripture', e.target.value)}
          placeholder="Enter your own scripture or inspirational text..."
          rows={4}
          className={inputClass}
        />
        <p className="text-[10px] text-muted-foreground/60 mt-1">Custom text overrides the selected scripture above.</p>
      </div>
    </div>
  )
}
