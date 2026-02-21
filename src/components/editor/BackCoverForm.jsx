import { useBrochureStore } from '../../stores/brochureStore'

export default function BackCoverForm() {
  const store = useBrochureStore()

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-zinc-400 mb-1">Back Cover Bible Verse</label>
        <textarea
          value={store.backCoverVerse}
          onChange={(e) => store.updateField('backCoverVerse', e.target.value)}
          rows={4}
          className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-600 resize-none"
        />
      </div>

      <div>
        <label className="block text-xs text-zinc-400 mb-1">Closing Phrase</label>
        <input
          type="text"
          value={store.backCoverPhrase}
          onChange={(e) => store.updateField('backCoverPhrase', e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-600"
        />
      </div>

      <div>
        <label className="block text-xs text-zinc-400 mb-1">Sub-text</label>
        <input
          type="text"
          value={store.backCoverSubtext}
          onChange={(e) => store.updateField('backCoverSubtext', e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-600"
        />
      </div>

      <div>
        <label className="block text-xs text-zinc-400 mb-1">Designer Credit (optional)</label>
        <input
          type="text"
          value={store.designerCredit}
          onChange={(e) => store.updateField('designerCredit', e.target.value)}
          placeholder="Designed by..."
          className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
        />
      </div>
    </div>
  )
}
