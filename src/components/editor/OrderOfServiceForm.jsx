import { useBrochureStore } from '../../stores/brochureStore'
import { Plus, Trash2, GripVertical, ChevronUp, ChevronDown } from 'lucide-react'

export default function OrderOfServiceForm() {
  const store = useBrochureStore()
  const { orderOfService } = store

  return (
    <div className="space-y-6">
      {/* Church Service */}
      <ServiceSection
        title="Part One — Church Service"
        subtitle="8:30 AM — 12:00 PM"
        items={orderOfService.churchService}
        section="churchService"
        store={store}
      />

      {/* Private Burial */}
      <ServiceSection
        title="Part Two — Private Burial"
        subtitle={store.burialLocation || ''}
        items={orderOfService.privateBurial}
        section="privateBurial"
        store={store}
      />
    </div>
  )
}

function ServiceSection({ title, subtitle, items, section, store }) {
  return (
    <div>
      <div className="mb-3">
        <h4 className="text-xs font-medium text-amber-500 uppercase tracking-wider">{title}</h4>
        {subtitle && <p className="text-[10px] text-zinc-500">{subtitle}</p>}
      </div>

      <div className="space-y-1">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2 items-center group">
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => i > 0 && store.moveServiceItem(section, i, i - 1)}
                disabled={i === 0}
                className="text-zinc-600 hover:text-zinc-400 disabled:opacity-20 transition-colors"
              >
                <ChevronUp size={12} />
              </button>
              <button
                onClick={() => i < items.length - 1 && store.moveServiceItem(section, i, i + 1)}
                disabled={i === items.length - 1}
                className="text-zinc-600 hover:text-zinc-400 disabled:opacity-20 transition-colors"
              >
                <ChevronDown size={12} />
              </button>
            </div>
            <input
              type="text"
              value={item.time}
              onChange={(e) => store.updateServiceItem(section, i, 'time', e.target.value)}
              placeholder="Time"
              className="w-24 bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
            />
            <input
              type="text"
              value={item.description}
              onChange={(e) => store.updateServiceItem(section, i, 'description', e.target.value)}
              placeholder="Description"
              className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
            />
            <button
              onClick={() => store.removeServiceItem(section, i)}
              className="p-1 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => store.addServiceItem(section)}
        className="flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-500 transition-colors mt-2"
      >
        <Plus size={14} /> Add Item
      </button>
    </div>
  )
}
