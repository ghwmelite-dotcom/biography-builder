import { usePosterStore } from '../../stores/posterStore'

export default function PosterAnnouncementForm() {
  const store = usePosterStore()
  const inputClass = 'w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-600 placeholder:text-zinc-600'

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-zinc-400 mb-1">Announcement Text</label>
        <textarea
          value={store.announcementText}
          onChange={(e) => store.updateField('announcementText', e.target.value)}
          rows={10}
          placeholder="The Amoah Family of ..., the Mensah Family of ..., Chiefs and people of ..., with deep sorrow announce the death of their beloved ..."
          className={inputClass}
        />
      </div>
      <div className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
        <p className="text-[10px] text-amber-500 font-medium mb-1">Writing Guide</p>
        <p className="text-[10px] text-zinc-500 leading-relaxed">
          This is the main announcement paragraph. Typically mentions the families, chiefs, and dignitaries announcing the death. Include hometown, clan, and community connections. This text appears prominently beside the portrait photo.
        </p>
      </div>
    </div>
  )
}
