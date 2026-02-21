import { useBrochureStore } from '../../stores/brochureStore'
import ImageUploader from './ImageUploader'
import { Plus, Trash2 } from 'lucide-react'

export default function PhotoGalleryForm() {
  const store = useBrochureStore()
  const photos = store.galleryPhotos

  return (
    <div className="space-y-3">
      <p className="text-[10px] text-zinc-500 mb-2">
        Photos are grouped by page title. Add a page title to group photos together on the same gallery page.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {photos.map((photo, i) => (
          <div key={photo.id} className="space-y-1.5 relative group">
            <ImageUploader
              value={photo.src}
              onChange={(v) => store.updateGalleryPhoto(i, 'src', v)}
              label={`Photo ${i + 1}`}
              aspectRatio="4/3"
            />
            <input
              type="text"
              value={photo.caption}
              onChange={(e) => store.updateGalleryPhoto(i, 'caption', e.target.value)}
              placeholder="Caption..."
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-[11px] text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
            />
            <input
              type="text"
              value={photo.pageTitle}
              onChange={(e) => store.updateGalleryPhoto(i, 'pageTitle', e.target.value)}
              placeholder="Page title (e.g. Treasured Memories)"
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-[11px] text-amber-400/70 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
            />
            {photos.length > 1 && (
              <button
                onClick={() => store.removeGalleryPhoto(i)}
                className="absolute top-1 right-1 p-1 bg-zinc-900/80 text-zinc-500 hover:text-red-400 rounded opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        ))}
      </div>

      {photos.length < 20 && (
        <button
          onClick={() => store.addGalleryPhoto()}
          className="flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-500 transition-colors"
        >
          <Plus size={14} /> Add Photo Slot
        </button>
      )}
    </div>
  )
}
