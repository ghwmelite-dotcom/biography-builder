import { useBannerStore } from '../../stores/bannerStore'

export default function BannerContentForm() {
  const store = useBannerStore()
  const inputClass = 'w-full bg-card border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/60'

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-muted-foreground mb-1">Scripture Verse</label>
        <textarea
          value={store.scriptureVerse}
          onChange={(e) => store.updateField('scriptureVerse', e.target.value)}
          placeholder="Enter a scripture verse..."
          rows={4}
          className={inputClass}
        />
      </div>
      <div>
        <label className="block text-xs text-muted-foreground mb-1">Scripture Reference</label>
        <input type="text" value={store.scriptureRef} onChange={(e) => store.updateField('scriptureRef', e.target.value)} placeholder="e.g. Psalm 23:1-2" className={inputClass} />
      </div>
      <div>
        <label className="block text-xs text-muted-foreground mb-1">Family Message</label>
        <textarea
          value={store.familyText}
          onChange={(e) => store.updateField('familyText', e.target.value)}
          placeholder="A short message from the family..."
          rows={3}
          className={inputClass}
        />
      </div>
    </div>
  )
}
