import BrochureMockup from './BrochureMockup'
import { themes } from '../../utils/themes'

export default function ThemePreviewCard({ themeKey, onClick }) {
  const t = themes[themeKey]
  if (!t) return null

  return (
    <button
      onClick={onClick}
      className="group flex flex-col bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-amber-600/40 transition-all duration-200 hover:shadow-lg hover:shadow-amber-600/5 text-left w-full"
    >
      {/* Scaled brochure preview */}
      <div className="p-4 pb-3 flex items-center justify-center">
        <div className="w-full max-w-[180px] rounded-lg overflow-hidden shadow-md group-hover:shadow-lg transition-shadow duration-200 ring-1 ring-zinc-700/50">
          <BrochureMockup themeKey={themeKey} className="text-[8px]" />
        </div>
      </div>

      {/* Theme info */}
      <div className="px-4 pb-4">
        {/* Color palette dots */}
        <div className="flex items-center gap-1.5 mb-2">
          <span
            className="w-3.5 h-3.5 rounded-full border border-zinc-600"
            style={{ backgroundColor: t.pageBg }}
            title="Background"
          />
          <span
            className="w-3.5 h-3.5 rounded-full border border-zinc-600"
            style={{ backgroundColor: t.heading }}
            title="Heading"
          />
          <span
            className="w-3.5 h-3.5 rounded-full border border-zinc-600"
            style={{ backgroundColor: t.border }}
            title="Accent"
          />
        </div>

        <h3 className="text-sm font-semibold text-zinc-200 group-hover:text-amber-400 transition-colors">
          {t.name}
        </h3>
        <p className="text-xs text-zinc-500 mt-0.5">
          {t.description}
        </p>
      </div>
    </button>
  )
}
