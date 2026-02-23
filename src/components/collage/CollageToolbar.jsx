import { useCollageStore } from '../../stores/collageStore'

export default function CollageToolbar() {
  const store = useCollageStore()
  const inputClass = 'w-full bg-card border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring'

  return (
    <div className="space-y-4">
      <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Style Options</h3>

      <div>
        <label className="block text-xs text-muted-foreground mb-1">Background Color</label>
        <div className="flex items-center gap-2">
          <input type="color" value={store.backgroundColor} onChange={(e) => store.updateField('backgroundColor', e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-input" />
          <input type="text" value={store.backgroundColor} onChange={(e) => store.updateField('backgroundColor', e.target.value)} className={`${inputClass} flex-1`} />
        </div>
      </div>

      <div>
        <label className="block text-xs text-muted-foreground mb-1">Border Color</label>
        <div className="flex items-center gap-2">
          <input type="color" value={store.borderColor} onChange={(e) => store.updateField('borderColor', e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-input" />
          <input type="text" value={store.borderColor} onChange={(e) => store.updateField('borderColor', e.target.value)} className={`${inputClass} flex-1`} />
        </div>
      </div>

      <div>
        <label className="block text-xs text-muted-foreground mb-1">Border Width: {store.borderWidth}px</label>
        <input type="range" min={0} max={10} value={store.borderWidth} onChange={(e) => store.updateField('borderWidth', Number(e.target.value))} className="w-full" />
      </div>

      <div>
        <label className="block text-xs text-muted-foreground mb-1">Cell Gap: {store.cellGap}px</label>
        <input type="range" min={0} max={16} value={store.cellGap} onChange={(e) => store.updateField('cellGap', Number(e.target.value))} className="w-full" />
      </div>

      <div>
        <label className="block text-xs text-muted-foreground mb-1">Text Color</label>
        <div className="flex items-center gap-2">
          <input type="color" value={store.overlayColor} onChange={(e) => store.updateField('overlayColor', e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-input" />
          <input type="text" value={store.overlayColor} onChange={(e) => store.updateField('overlayColor', e.target.value)} className={`${inputClass} flex-1`} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" checked={store.showOverlay} onChange={(e) => store.updateField('showOverlay', e.target.checked)} className="rounded border-input" id="showOverlay" />
        <label htmlFor="showOverlay" className="text-xs text-card-foreground cursor-pointer">Show name & captions overlay</label>
      </div>

      {/* Captions for each cell */}
      <div>
        <h4 className="text-xs text-muted-foreground mb-2">Photo Captions</h4>
        <div className="space-y-2">
          {store.cells.map((cell, idx) => (
            <input
              key={cell.id}
              type="text"
              value={cell.caption}
              onChange={(e) => store.updateCell(cell.id, 'caption', e.target.value)}
              placeholder={`Photo ${idx + 1} caption`}
              className={`${inputClass} text-xs`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
