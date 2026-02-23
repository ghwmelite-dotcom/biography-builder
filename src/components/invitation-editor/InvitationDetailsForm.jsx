import { useInvitationStore } from '../../stores/invitationStore'

export default function InvitationDetailsForm() {
  const store = useInvitationStore()
  const inputClass = 'w-full bg-card border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/60'

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-muted-foreground mb-1">RSVP Phone Number</label>
        <input type="text" value={store.rsvpPhone} onChange={(e) => store.updateField('rsvpPhone', e.target.value)} placeholder="e.g. 0244 123 456" className={inputClass} />
      </div>

      <div>
        <label className="block text-xs text-muted-foreground mb-1">Location</label>
        <input type="text" value={store.location} onChange={(e) => store.updateField('location', e.target.value)} placeholder="e.g. Accra, Ghana" className={inputClass} />
      </div>

      <div>
        <label className="block text-xs text-muted-foreground mb-1">Dress Code</label>
        <input type="text" value={store.dressCode} onChange={(e) => store.updateField('dressCode', e.target.value)} placeholder="e.g. BLACK & WHITE" className={inputClass} />
      </div>

      <div>
        <label className="block text-xs text-muted-foreground mb-1">Custom Message <span className="text-muted-foreground/60">(Optional)</span></label>
        <textarea
          value={store.customMessage}
          onChange={(e) => store.updateField('customMessage', e.target.value)}
          rows={3}
          placeholder="e.g. Your presence and prayers are humbly requested."
          className={inputClass}
        />
        <p className="text-[10px] text-muted-foreground/60 mt-1">This appears at the bottom of the invitation</p>
      </div>
    </div>
  )
}
