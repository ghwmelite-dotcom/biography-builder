import { useThankYouStore } from '../../stores/thankYouStore'

export default function ThankYouMessageForm() {
  const store = useThankYouStore()
  const inputClass = 'w-full bg-card border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/60'

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-muted-foreground mb-1">Thank You Message</label>
        <textarea
          value={store.thankYouMessage}
          onChange={(e) => store.updateField('thankYouMessage', e.target.value)}
          placeholder="Express your gratitude to those who attended and supported your family..."
          rows={6}
          className={inputClass}
        />
      </div>
      <div>
        <label className="block text-xs text-muted-foreground mb-1">Family Signature</label>
        <input type="text" value={store.familySignature} onChange={(e) => store.updateField('familySignature', e.target.value)} placeholder="e.g. The Allied Families" className={inputClass} />
      </div>
      <div>
        <label className="block text-xs text-muted-foreground mb-1">Closing Line <span className="text-muted-foreground/60">(Optional)</span></label>
        <input type="text" value={store.customClosing} onChange={(e) => store.updateField('customClosing', e.target.value)} placeholder="e.g. God bless you abundantly." className={inputClass} />
      </div>
    </div>
  )
}
