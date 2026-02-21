import { useBrochureStore } from '../../stores/brochureStore'
import { themes } from '../../utils/themes'

const TITLES = ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Rev.', 'Prof.', 'Chief', 'Nana', 'Hon.', 'Togbe', 'Mama']

export default function BasicInfoForm() {
  const store = useBrochureStore()

  return (
    <div className="space-y-4">
      {/* Title + Name */}
      <div className="flex gap-3">
        <div className="w-28">
          <label className="block text-xs text-zinc-400 mb-1">Title</label>
          <select
            value={store.title}
            onChange={(e) => store.updateField('title', e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-600"
          >
            <option value="">—</option>
            {TITLES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs text-zinc-400 mb-1">Full Name of Deceased</label>
          <input
            type="text"
            value={store.fullName}
            onChange={(e) => store.updateField('fullName', e.target.value)}
            placeholder="e.g. Josephine Worla Ameovi-Hodges"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
          />
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-zinc-400 mb-1">Date of Birth</label>
          <input
            type="date"
            value={store.dateOfBirth}
            onChange={(e) => store.updateField('dateOfBirth', e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-600"
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-400 mb-1">Date of Death</label>
          <input
            type="date"
            value={store.dateOfDeath}
            onChange={(e) => store.updateField('dateOfDeath', e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-600"
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-400 mb-1">Funeral Date</label>
          <input
            type="date"
            value={store.funeralDate}
            onChange={(e) => store.updateField('funeralDate', e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-600"
          />
        </div>
      </div>

      {/* Time */}
      <div>
        <label className="block text-xs text-zinc-400 mb-1">Funeral Start Time</label>
        <input
          type="time"
          value={store.funeralTime}
          onChange={(e) => store.updateField('funeralTime', e.target.value)}
          className="w-44 bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-600"
        />
      </div>

      {/* Venue */}
      <div>
        <label className="block text-xs text-zinc-400 mb-1">Funeral Venue</label>
        <input
          type="text"
          value={store.funeralVenue}
          onChange={(e) => store.updateField('funeralVenue', e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
        />
      </div>

      {/* Burial Location */}
      <div>
        <label className="block text-xs text-zinc-400 mb-1">Burial Location</label>
        <input
          type="text"
          value={store.burialLocation}
          onChange={(e) => store.updateField('burialLocation', e.target.value)}
          placeholder="e.g. Anloga, Volta Region"
          className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
        />
      </div>

      {/* Theme Selector */}
      <div>
        <label className="block text-xs text-zinc-400 mb-2">Brochure Theme</label>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(themes).map(([key, t]) => (
            <button
              key={key}
              onClick={() => store.updateField('theme', key)}
              className={`
                p-3 rounded-lg border text-left transition-all
                ${store.theme === key
                  ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/30'
                  : 'border-zinc-700 bg-zinc-900 hover:border-zinc-500'
                }
              `}
            >
              <div className="flex gap-1 mb-1.5">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: t.pageBg, border: '1px solid #444' }} />
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: t.heading }} />
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: t.border }} />
              </div>
              <div className="text-xs font-medium text-zinc-300">{t.name}</div>
              <div className="text-[10px] text-zinc-500">{t.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
