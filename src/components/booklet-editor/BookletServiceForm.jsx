import { useBookletStore } from '../../stores/bookletStore'
import { Plus, X } from 'lucide-react'

export default function BookletServiceForm() {
  const store = useBookletStore()
  const inputClass = 'w-full bg-card border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/60'

  return (
    <div className="space-y-3">
      <p className="text-[10px] text-muted-foreground/60">Add the order of service items for the programme.</p>
      {store.orderOfService.map((item, idx) => (
        <div key={idx} className="flex gap-2 items-start">
          <input
            type="text"
            value={item.time}
            onChange={(e) => store.updateServiceItem(idx, 'time', e.target.value)}
            placeholder="Time"
            className={`${inputClass} w-24 shrink-0`}
          />
          <input
            type="text"
            value={item.item}
            onChange={(e) => store.updateServiceItem(idx, 'item', e.target.value)}
            placeholder="Service item..."
            className={inputClass}
          />
          {store.orderOfService.length > 1 && (
            <button onClick={() => store.removeServiceItem(idx)} className="p-2 text-muted-foreground hover:text-red-400 shrink-0">
              <X size={14} />
            </button>
          )}
        </div>
      ))}
      <button onClick={() => store.addServiceItem()} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors">
        <Plus size={12} /> Add Item
      </button>
    </div>
  )
}
