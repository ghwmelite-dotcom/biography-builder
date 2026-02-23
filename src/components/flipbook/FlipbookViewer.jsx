import { useRef, useState, useCallback, useEffect, forwardRef } from 'react'
import HTMLFlipBook from 'react-pageflip'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import FlipbookToolbar from './FlipbookToolbar'

const ZOOM_STEPS = [0.5, 0.75, 1, 1.25, 1.5, 2]
const BASE_WIDTH = 400
const BASE_HEIGHT = 566

const PageImage = forwardRef(function PageImage({ src, pageNum }, ref) {
  return (
    <div ref={ref} className="bg-white">
      <img
        src={src}
        alt={`Page ${pageNum}`}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    </div>
  )
})

export default function FlipbookViewer({ images, onDownload }) {
  const bookRef = useRef(null)
  const containerRef = useRef(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const totalPages = images.length
  const isMobile = useMediaQuery('(max-width: 768px)')

  const fullscreenEnabled = typeof document !== 'undefined' && !!document.fullscreenEnabled

  // Page flip handler
  const onFlip = useCallback((e) => {
    setCurrentPage(e.data)
  }, [])

  // Navigation
  const goNext = () => bookRef.current?.pageFlip()?.flipNext()
  const goPrev = () => bookRef.current?.pageFlip()?.flipPrev()
  const goToPage = (pageIndex) => {
    bookRef.current?.pageFlip()?.turnToPage(pageIndex)
  }

  // Zoom
  const zoomIn = () => {
    setZoomLevel((prev) => {
      const next = ZOOM_STEPS.find((s) => s > prev)
      return next ?? prev
    })
  }
  const zoomOut = () => {
    setZoomLevel((prev) => {
      const next = [...ZOOM_STEPS].reverse().find((s) => s < prev)
      return next ?? prev
    })
  }
  const zoomReset = () => setZoomLevel(1)

  // Fullscreen
  const toggleFullscreen = async () => {
    if (!containerRef.current) return
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (err) {
      console.error('Fullscreen error:', err)
    }
  }

  // Listen for fullscreen changes
  useEffect(() => {
    const handler = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goPrev()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        goNext()
      } else if (e.key === 'Escape' && isFullscreen) {
        // browser handles Escape for fullscreen, but just in case
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isFullscreen])

  if (!images || images.length === 0) return null

  const scaledWidth = Math.round(BASE_WIDTH * zoomLevel)
  const scaledHeight = Math.round(BASE_HEIGHT * zoomLevel)

  return (
    <div
      ref={containerRef}
      className={`flex flex-col items-center gap-4 ${isFullscreen ? 'bg-background justify-center min-h-screen p-4' : ''}`}
    >
      {/* Book container */}
      <div className="relative" style={{ transition: 'all 0.3s ease' }}>
        <HTMLFlipBook
          ref={bookRef}
          width={scaledWidth}
          height={scaledHeight}
          size="stretch"
          minWidth={Math.round(280 * zoomLevel)}
          maxWidth={Math.round(600 * zoomLevel)}
          minHeight={Math.round(396 * zoomLevel)}
          maxHeight={Math.round(850 * zoomLevel)}
          showCover={true}
          mobileScrollSupport={true}
          onFlip={onFlip}
          className="shadow-2xl"
          style={{}}
          startPage={0}
          drawShadow={true}
          flippingTime={800}
          usePortrait={isMobile}
          startZIndex={0}
          autoSize={true}
          maxShadowOpacity={0.5}
          showPageCorners={true}
          disableFlipByClick={false}
        >
          {images.map((src, i) => (
            <PageImage key={i} src={src} pageNum={i + 1} />
          ))}
        </HTMLFlipBook>
      </div>

      {/* Toolbar */}
      <FlipbookToolbar
        currentPage={currentPage}
        totalPages={totalPages}
        zoomLevel={zoomLevel}
        isFullscreen={isFullscreen}
        fullscreenEnabled={fullscreenEnabled}
        onPrev={goPrev}
        onNext={goNext}
        onPageJump={goToPage}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onZoomReset={zoomReset}
        onToggleFullscreen={toggleFullscreen}
        onDownload={onDownload}
      />
    </div>
  )
}
