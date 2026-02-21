import { useState, useEffect, useCallback } from 'react'

export function usePdfToImages(pdfBlob, scale = 2) {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(0)

  const render = useCallback(async (blob) => {
    if (!blob) return
    setLoading(true)
    setError(null)
    setProgress(0)

    try {
      const pdfjsLib = await import('pdfjs-dist')

      // Set worker
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.mjs',
        import.meta.url
      ).toString()

      const arrayBuffer = await blob.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const pageImages = []

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale })

        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        const ctx = canvas.getContext('2d')

        await page.render({ canvasContext: ctx, viewport }).promise
        pageImages.push(canvas.toDataURL('image/jpeg', 0.92))
        setProgress(Math.round((i / pdf.numPages) * 100))
      }

      setImages(pageImages)
    } catch (err) {
      console.error('PDF to images error:', err)
      setError(err.message || 'Failed to render PDF pages')
    } finally {
      setLoading(false)
    }
  }, [scale])

  useEffect(() => {
    if (pdfBlob) render(pdfBlob)
  }, [pdfBlob, render])

  return { images, loading, error, progress }
}
