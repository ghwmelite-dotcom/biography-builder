import { useBrochureStore } from '../../stores/brochureStore'
import { defaultScriptures } from '../../utils/defaultData'

export default function ScriptureForm() {
  const store = useBrochureStore()

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-zinc-400 mb-1">Select Scripture</label>
        <select
          value={store.scriptureKey}
          onChange={(e) => store.updateField('scriptureKey', e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-600"
        >
          {Object.entries(defaultScriptures).map(([key, s]) => (
            <option key={key} value={key}>{s.title} — {s.subtitle}</option>
          ))}
          <option value="custom">Custom Scripture</option>
        </select>
      </div>

      {store.scriptureKey === 'custom' && (
        <div>
          <label className="block text-xs text-zinc-400 mb-1">Custom Scripture Text</label>
          <textarea
            value={store.customScripture}
            onChange={(e) => store.updateField('customScripture', e.target.value)}
            rows={10}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-600 resize-none"
            placeholder="Enter custom scripture text..."
          />
        </div>
      )}

      <div>
        <label className="block text-xs text-zinc-400 mb-1">Additional Verse (bottom of page)</label>
        <textarea
          value={store.additionalVerse}
          onChange={(e) => store.updateField('additionalVerse', e.target.value)}
          rows={4}
          className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-600 resize-none"
        />
      </div>
    </div>
  )
}
