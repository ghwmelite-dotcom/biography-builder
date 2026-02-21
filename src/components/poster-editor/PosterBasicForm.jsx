import { usePosterStore } from '../../stores/posterStore'

export default function PosterBasicForm() {
  const store = usePosterStore()

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => store.updateField('photo', ev.target.result)
    reader.readAsDataURL(file)
  }

  const inputClass = 'w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-600 placeholder:text-zinc-600'

  return (
    <div className="space-y-4">
      {/* Header Title */}
      <div>
        <label className="block text-xs text-zinc-400 mb-1">Banner Title</label>
        <input type="text" value={store.headerTitle} onChange={(e) => store.updateField('headerTitle', e.target.value)} placeholder="CALLED TO GLORY" className={inputClass} />
        <p className="text-[10px] text-zinc-600 mt-1">Appears at the top of the poster</p>
      </div>

      {/* Photo Upload */}
      <div>
        <label className="block text-xs text-zinc-400 mb-1">Portrait Photo</label>
        {store.photo ? (
          <div className="relative w-32 h-40 rounded-lg overflow-hidden border border-zinc-700">
            <img src={store.photo} alt="Portrait" className="w-full h-full object-cover" />
            <button onClick={() => store.updateField('photo', null)} className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-500">×</button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-32 h-40 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer hover:border-amber-600/50 transition-colors">
            <span className="text-zinc-500 text-2xl mb-1">+</span>
            <span className="text-[10px] text-zinc-600">Upload Photo</span>
            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
          </label>
        )}
      </div>

      {/* Full Name */}
      <div>
        <label className="block text-xs text-zinc-400 mb-1">Full Name of Deceased</label>
        <input type="text" value={store.fullName} onChange={(e) => store.updateField('fullName', e.target.value)} placeholder="e.g. Joseph Kofi Mensah" className={inputClass} />
      </div>

      {/* Alias */}
      <div>
        <label className="block text-xs text-zinc-400 mb-1">Alias / Title <span className="text-zinc-600">(Optional)</span></label>
        <input type="text" value={store.alias} onChange={(e) => store.updateField('alias', e.target.value)} placeholder='e.g. "SUKUTOR"' className={inputClass} />
        <p className="text-[10px] text-zinc-600 mt-1">Will appear in parentheses below the name</p>
      </div>

      {/* Age */}
      <div className="w-32">
        <label className="block text-xs text-zinc-400 mb-1">Age at Death</label>
        <input type="text" value={store.age} onChange={(e) => store.updateField('age', e.target.value)} placeholder="e.g. 78" className={inputClass} />
      </div>

      {/* Date & Place of Death */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-zinc-400 mb-1">Date of Death</label>
          <input type="date" value={store.dateOfDeath} onChange={(e) => store.updateField('dateOfDeath', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs text-zinc-400 mb-1">Place of Death</label>
          <input type="text" value={store.placeOfDeath} onChange={(e) => store.updateField('placeOfDeath', e.target.value)} placeholder="e.g. Accra, Ghana" className={inputClass} />
        </div>
      </div>
    </div>
  )
}
