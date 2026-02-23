import { useCollageStore, COLLAGE_TEMPLATES } from '../../stores/collageStore'
import { Grid3X3, Heart, Cross, Circle, Diamond, Columns2 } from 'lucide-react'

const iconMap = {
  grid: Grid3X3,
  heart: Heart,
  cross: Cross,
  circle: Circle,
  diamond: Diamond,
  columns: Columns2,
}

export default function CollageTemplatePicker() {
  const store = useCollageStore()

  return (
    <div>
      <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">Layout Template</h3>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(COLLAGE_TEMPLATES).map(([key, tpl]) => {
          const Icon = iconMap[tpl.icon] || Grid3X3
          return (
            <button
              key={key}
              onClick={() => store.setTemplate(key)}
              className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all ${
                store.templateId === key
                  ? 'border-primary bg-primary/10 ring-1 ring-primary/30'
                  : 'border-input bg-card hover:border-muted-foreground'
              }`}
            >
              <Icon size={14} className="text-primary shrink-0" />
              <div>
                <div className="text-xs font-medium text-card-foreground">{tpl.name}</div>
                <div className="text-[10px] text-muted-foreground">{tpl.cells} photos</div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
