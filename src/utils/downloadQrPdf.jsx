import { pdf, Document, Page, Image } from '@react-pdf/renderer'
import { toPng } from 'html-to-image'

const CREAM = '#FDF8F0'

// A4 in points (used by @react-pdf/renderer)
const A4_W = 595.28
const A4_H = 841.89

/**
 * Capture a DOM element as a high-res PNG, wrap in an A4 PDF, and trigger download.
 */
export async function downloadCardAsPdf(element, filename) {
  const dataUrl = await toPng(element, {
    pixelRatio: 3,
    cacheBust: true,
    backgroundColor: CREAM,
  })

  const PdfDoc = () => (
    <Document>
      <Page size="A4" style={{ margin: 0, padding: 0 }}>
        <Image src={dataUrl} style={{ width: A4_W, height: A4_H }} />
      </Page>
    </Document>
  )

  const blob = await pdf(<PdfDoc />).toBlob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
