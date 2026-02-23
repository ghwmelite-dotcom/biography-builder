import { useThankYouStore } from '../../stores/thankYouStore'
import { thankYouThemes } from '../../utils/thankYouDefaultData'

export default function ThankYouThemeForm() {
  const store = useThankYouStore()

  return (
    <div>
      <label className="block text-xs text-muted-foreground mb-2">Thank You Card Theme</label>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(thankYouThemes).map(([key, t]) => (
          <button
            key={key}
            onClick={() => store.updateField('thankYouTheme', key)}
            className={`p-3 rounded-lg border text-left transition-all ${
              store.thankYouTheme === key
                ? 'border-primary bg-primary/10 ring-1 ring-primary/30'
                : 'border-input bg-card hover:border-muted-foreground'
            }`}
          >
            <div className="flex gap-1 mb-1.5">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: t.headerBg, border: '1px solid #444' }} />
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: t.accent }} />
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: t.detailsBg, border: '1px solid #444' }} />
            </div>
            <div className="text-xs font-medium text-card-foreground">{t.name}</div>
            <div className="text-[10px] text-muted-foreground">{t.description}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
