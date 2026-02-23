import { Plus, Trash2 } from 'lucide-react'
import { useInvitationStore } from '../../stores/invitationStore'

export default function InvitationEventsForm() {
  const store = useInvitationStore()
  const events = store.events
  const inputClass = 'w-full bg-card border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/60'

  return (
    <div className="space-y-3">
      <p className="text-[10px] text-muted-foreground">Add each funeral event with its details. You can add up to 5 events.</p>

      {events.map((event, i) => (
        <div key={i} className="p-3 bg-card/50 border border-border rounded-lg space-y-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-primary font-medium uppercase tracking-wider">Event {i + 1}</span>
            {events.length > 1 && (
              <button onClick={() => store.removeEvent(i)} className="p-1 text-muted-foreground/60 hover:text-red-400 transition-colors">
                <Trash2 size={13} />
              </button>
            )}
          </div>

          <input
            type="text"
            value={event.title}
            onChange={(e) => store.updateEvent(i, 'title', e.target.value)}
            placeholder="Event title, e.g. BURIAL SERVICE"
            className={inputClass}
          />

          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={event.date}
              onChange={(e) => store.updateEvent(i, 'date', e.target.value)}
              placeholder="Date, e.g. Saturday, 15th March 2025"
              className={inputClass}
            />
            <input
              type="text"
              value={event.time}
              onChange={(e) => store.updateEvent(i, 'time', e.target.value)}
              placeholder="Time, e.g. 10:00 AM"
              className={inputClass}
            />
          </div>

          <input
            type="text"
            value={event.venue}
            onChange={(e) => store.updateEvent(i, 'venue', e.target.value)}
            placeholder="Venue, e.g. Holy Trinity Cathedral, Accra"
            className={inputClass}
          />

          <textarea
            value={event.details}
            onChange={(e) => store.updateEvent(i, 'details', e.target.value)}
            rows={2}
            placeholder="Additional details (optional)"
            className={inputClass}
          />
        </div>
      ))}

      {events.length < 5 && (
        <button
          onClick={() => store.addEvent()}
          className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/90 transition-colors"
        >
          <Plus size={14} /> Add Event
        </button>
      )}
    </div>
  )
}
