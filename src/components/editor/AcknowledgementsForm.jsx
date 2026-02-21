import { useBrochureStore } from '../../stores/brochureStore'

export default function AcknowledgementsForm() {
  const store = useBrochureStore()

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-zinc-400 mb-1">Acknowledgements Text</label>
        <textarea
          value={store.acknowledgements}
          onChange={(e) => store.updateField('acknowledgements', e.target.value)}
          rows={8}
          className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-600 resize-none leading-relaxed"
        />
      </div>

      <div>
        <label className="block text-xs text-zinc-400 mb-1">Family Signature</label>
        <input
          type="text"
          value={store.familySignature}
          onChange={(e) => store.updateField('familySignature', e.target.value)}
          placeholder="e.g. The Hodges & Amewovi Families"
          className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
        />
      </div>
    </div>
  )
}
