import { useState } from 'react'
import { useBrochureStore } from '../../stores/brochureStore'
import ImageUploader from './ImageUploader'
import WordCountIndicator from './WordCountIndicator'
import WritingPromptsDialog from './WritingPromptsDialog'
import { biographyWritingGuide } from '../../utils/writingPrompts'
import { Lightbulb } from 'lucide-react'

export default function BiographyForm() {
  const store = useBrochureStore()
  const [guideOpen, setGuideOpen] = useState(false)

  const handleInsertGuideText = (text) => {
    store.updateField('biography', text)
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs text-zinc-400">Biography Text</label>
          <WordCountIndicator text={store.biography} min={300} max={500} />
        </div>

        {/* Writing guide button */}
        <button
          onClick={() => setGuideOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 mb-2 text-[11px] bg-zinc-800 border border-zinc-700 rounded-md text-amber-400 hover:text-amber-300 hover:border-amber-600/50 transition-colors"
        >
          <Lightbulb size={12} />
          Writing guide
        </button>

        <textarea
          value={store.biography}
          onChange={(e) => store.updateField('biography', e.target.value)}
          rows={14}
          className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-600 resize-none leading-relaxed"
          placeholder="Write the biography of the deceased. Separate paragraphs with blank lines..."
        />
        <p className="text-[10px] text-zinc-600 mt-1">Separate paragraphs with blank lines. Each paragraph break creates a new paragraph in the PDF.</p>
      </div>

      {/* Biography photos */}
      <div>
        <label className="block text-xs text-zinc-400 mb-2">Biography Photos (optional, up to 3)</label>
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i}>
              <ImageUploader
                value={store.biographyPhotos[i]}
                onChange={(v) => store.updateBiographyPhoto(i, v)}
                label={`Photo ${i + 1}`}
                aspectRatio="4/3"
                recommendedText="Recommended: 800x600px landscape"
              />
              <input
                type="text"
                value={store.biographyPhotoCaptions[i]}
                onChange={(e) => store.updateBiographyCaption(i, e.target.value)}
                placeholder="Caption..."
                className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-[11px] text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Writing prompts dialog */}
      <WritingPromptsDialog
        open={guideOpen}
        onOpenChange={setGuideOpen}
        guide={biographyWritingGuide}
        onInsert={handleInsertGuideText}
      />
    </div>
  )
}
