import { useInvitationStore } from '../../stores/invitationStore'

export default function InvitationAnnouncementForm() {
  const store = useInvitationStore()
  const inputClass = 'w-full bg-card border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/60'

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-muted-foreground mb-1">Family Announcement</label>
        <textarea
          value={store.familyAnnouncement}
          onChange={(e) => store.updateField('familyAnnouncement', e.target.value)}
          rows={8}
          placeholder="The Allied Families of ..., the Chiefs and people of ..., cordially invite you to the funeral and burial ceremonies of their beloved ..."
          className={inputClass}
        />
      </div>
      <div className="p-3 bg-card/50 border border-border rounded-lg">
        <p className="text-[10px] text-primary font-medium mb-1">Writing Guide</p>
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          This is the main invitation paragraph. Mention the allied families, chiefs, community leaders, and dignitaries inviting guests. Include hometown and clan connections. This text appears prominently on the invitation card.
        </p>
      </div>
    </div>
  )
}
