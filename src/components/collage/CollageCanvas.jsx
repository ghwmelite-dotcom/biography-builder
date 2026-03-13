import { useCollageStore, COLLAGE_TEMPLATES } from '../../stores/collageStore'
import { X } from 'lucide-react'

export default function CollageCanvas() {
  const store = useCollageStore()
  const template = COLLAGE_TEMPLATES[store.templateId]

  const handlePhotoUpload = (cellId) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => store.setCellPhoto(cellId, ev.target.result)
      reader.readAsDataURL(file)
    }
    input.click()
  }

  if (!template) return null

  // Cross shape mask: only show cells at indices 1, 3, 4, 5, 7 in a 3x3 grid
  const crossMask = [false, true, false, true, true, true, false, true, false]

  const getGridStyle = () => {
    const baseStyle = {
      display: 'grid',
      gridTemplateColumns: `repeat(${template.cols}, 1fr)`,
      gridTemplateRows: `repeat(${template.rows}, 1fr)`,
      gap: store.cellGap,
      backgroundColor: store.backgroundColor,
      border: `${store.borderWidth}px solid ${store.borderColor}`,
      padding: store.cellGap,
      width: '100%',
      maxWidth: 500,
      aspectRatio: template.cols === template.rows ? '1' : `${template.cols}/${template.rows}`,
    }

    if (template.shape === 'circle') {
      return { ...baseStyle, borderRadius: '50%', overflow: 'hidden', aspectRatio: '1' }
    }

    return baseStyle
  }

  const renderCells = () => {
    return store.cells.map((cell, idx) => {
      // Skip hidden cells for cross shape
      if (template.shape === 'cross' && !crossMask[idx]) {
        return <div key={cell.id} style={{ visibility: 'hidden' }} />
      }

      return (
        <div
          key={cell.id}
          onClick={() => !cell.photo && handlePhotoUpload(cell.id)}
          className="relative group cursor-pointer overflow-hidden"
          style={{
            backgroundColor: '#1A1A1A',
            aspectRatio: '1',
            borderRadius: template.shape === 'diamond' ? '4px' : '2px',
            transform: template.shape === 'diamond' ? 'rotate(45deg)' : undefined,
          }}
        >
          {cell.photo ? (
            <>
              <img
                src={cell.photo}
                alt={cell.caption || 'Photo'}
                className="w-full h-full object-cover"
                style={{ transform: template.shape === 'diamond' ? 'rotate(-45deg) scale(1.42)' : undefined }}
              />
              <button
                onClick={(e) => { e.stopPropagation(); store.removeCellPhoto(cell.id) }}
                className="absolute top-1 right-1 w-5 h-5 bg-red-600/80 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ transform: template.shape === 'diamond' ? 'rotate(-45deg)' : undefined }}
              >
                <X size={10} />
              </button>
              {cell.caption && store.showOverlay && (
                <div
                  className="absolute left-0 right-0 px-2 py-1 text-center"
                  style={{
                    [store.overlayPosition === 'bottom' ? 'bottom' : 'top']: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    color: store.overlayColor,
                    fontSize: '0.65em',
                    transform: template.shape === 'diamond' ? 'rotate(-45deg)' : undefined,
                  }}
                >
                  {cell.caption}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ transform: template.shape === 'diamond' ? 'rotate(-45deg)' : undefined }}>
              <span className="text-muted-foreground text-2xl">+</span>
            </div>
          )}
        </div>
      )
    })
  }

  return (
    <div id="collage-canvas" className="relative">
      <div style={getGridStyle()}>
        {renderCells()}
      </div>

      {/* Name/dates overlay */}
      {store.showOverlay && (store.name || store.dates) && (
        <div
          className="text-center mt-3"
          style={{ color: store.overlayColor }}
        >
          {store.name && (
            <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1.1em', letterSpacing: '0.05em' }}>
              {store.name}
            </div>
          )}
          {store.dates && (
            <div style={{ fontSize: '0.75em', opacity: 0.7, marginTop: 2 }}>
              {store.dates}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
