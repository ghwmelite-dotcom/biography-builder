import { useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Download,
  RotateCcw,
} from 'lucide-react'
import { useMediaQuery } from '../../hooks/useMediaQuery'

const ZOOM_STEPS = [0.5, 0.75, 1, 1.25, 1.5, 2]

export default function FlipbookToolbar({
  currentPage,
  totalPages,
  zoomLevel,
  isFullscreen,
  fullscreenEnabled,
  onPrev,
  onNext,
  onPageJump,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onToggleFullscreen,
  onDownload,
}) {
  const [jumpValue, setJumpValue] = useState('')
  const isMobile = useMediaQuery('(max-width: 768px)')

  const handleJumpSubmit = (e) => {
    e.preventDefault()
    const page = parseInt(jumpValue, 10)
    if (page >= 1 && page <= totalPages) {
      onPageJump(page - 1)
      setJumpValue('')
    }
  }

  const canZoomIn = zoomLevel < ZOOM_STEPS[ZOOM_STEPS.length - 1]
  const canZoomOut = zoomLevel > ZOOM_STEPS[0]
  const zoomPercent = Math.round(zoomLevel * 100)

  const btnClass =
    'p-2 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors rounded-md hover:bg-muted'

  return (
    <div className="flex items-center justify-center gap-1 flex-wrap">
      {/* Page navigation */}
      <div className="flex items-center gap-1">
        <button
          onClick={onPrev}
          disabled={currentPage === 0}
          className={btnClass}
          title="Previous page"
        >
          <ChevronLeft size={18} />
        </button>

        <span className="text-xs text-muted-foreground tabular-nums min-w-[72px] text-center select-none">
          {currentPage + 1} / {totalPages}
        </span>

        <button
          onClick={onNext}
          disabled={currentPage >= totalPages - 1}
          className={btnClass}
          title="Next page"
        >
          <ChevronRight size={18} />
        </button>

        {/* Page jump — hide on mobile */}
        {!isMobile && (
          <form onSubmit={handleJumpSubmit} className="ml-1">
            <input
              type="number"
              min={1}
              max={totalPages}
              value={jumpValue}
              onChange={(e) => setJumpValue(e.target.value)}
              placeholder="Go to"
              className="w-16 h-7 text-xs text-center bg-muted border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary tabular-nums"
            />
          </form>
        )}
      </div>

      {/* Divider */}
      {!isMobile && (
        <>
          <div className="w-px h-5 bg-border mx-1" />

          {/* Zoom controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={onZoomOut}
              disabled={!canZoomOut}
              className={btnClass}
              title="Zoom out"
            >
              <ZoomOut size={16} />
            </button>

            <span className="text-xs text-muted-foreground tabular-nums min-w-[40px] text-center select-none">
              {zoomPercent}%
            </span>

            <button
              onClick={onZoomIn}
              disabled={!canZoomIn}
              className={btnClass}
              title="Zoom in"
            >
              <ZoomIn size={16} />
            </button>

            <button
              onClick={onZoomReset}
              disabled={zoomLevel === 1}
              className={btnClass}
              title="Reset zoom"
            >
              <RotateCcw size={14} />
            </button>
          </div>

          <div className="w-px h-5 bg-border mx-1" />
        </>
      )}

      {/* Fullscreen & Download */}
      <div className="flex items-center gap-1">
        {!isMobile && fullscreenEnabled && (
          <button
            onClick={onToggleFullscreen}
            className={btnClass}
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>
        )}

        {onDownload && (
          <button onClick={onDownload} className={btnClass} title="Download PDF">
            <Download size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
