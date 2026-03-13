import { Download } from 'lucide-react'
import { useNotification } from '../ui/notification'

export default function CollageExport() {
  const { notify } = useNotification()

  const handleExportPNG = async () => {
    const canvas = document.getElementById('collage-canvas')
    if (!canvas) {
      notify('No collage to export', 'error')
      return
    }

    try {
      // Use a simple approach: render the DOM element to canvas
      const dataUrl = await domToImage(canvas)
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = 'Memorial-Collage.png'
      a.click()
      notify('Collage exported as PNG!', 'success')
    } catch {
      // Fallback: use canvas API
      notify('Export failed. Try a screenshot instead.', 'error')
    }
  }

  return (
    <button
      onClick={handleExportPNG}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      title="Export as PNG"
    >
      <Download size={14} />
      <span className="hidden sm:inline">Export</span>
    </button>
  )
}

// Simple DOM to image using canvas
async function domToImage(element) {
  const canvas = document.createElement('canvas')
  const rect = element.getBoundingClientRect()
  const scale = 2
  canvas.width = rect.width * scale
  canvas.height = rect.height * scale

  const ctx = canvas.getContext('2d')
  ctx.scale(scale, scale)

  // Use the experimental html2canvas-like approach
  // For a simple version, we'll use foreignObject in SVG
  const svgData = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}">
      <foreignObject width="100%" height="100%">
        ${new XMLSerializer().serializeToString(element)}
      </foreignObject>
    </svg>
  `

  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.onload = () => {
      ctx.drawImage(img, 0, 0)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = reject
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData)
  })
}
