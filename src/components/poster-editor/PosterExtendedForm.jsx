import { usePosterStore } from '../../stores/posterStore'

export default function PosterExtendedForm() {
  const store = usePosterStore()
  const inputClass = 'w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-600 placeholder:text-zinc-600'

  const fields = [
    { key: 'brothersSisters', label: 'Brothers & Sisters', placeholder: 'List names...' },
    { key: 'cousins', label: 'Cousins', placeholder: 'List names...' },
    { key: 'nephewsNieces', label: 'Nephews & Nieces', placeholder: 'List names...' },
    { key: 'chiefMourners', label: 'Chief Mourners', placeholder: 'List chief mourners...' },
  ]

  return (
    <div className="space-y-3">
      <p className="text-[10px] text-zinc-500">These appear in the right column of the details section on the poster.</p>
      {fields.map((f) => (
        <div key={f.key}>
          <label className="block text-xs text-zinc-400 mb-1">{f.label}</label>
          <textarea value={store[f.key]} onChange={(e) => store.updateField(f.key, e.target.value)} rows={3} placeholder={f.placeholder} className={inputClass} />
        </div>
      ))}
    </div>
  )
}
