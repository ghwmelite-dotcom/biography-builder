import { Document } from '@react-pdf/renderer'
import { getTheme } from '../../utils/themes'
import CoverPage from './CoverPage'
import ScripturePage from './ScripturePage'
import OfficialsPage from './OfficialsPage'
import OrderOfServicePages from './OrderOfServicePage'
import BiographyPages from './BiographyPages'
import TributePages from './TributePage'
import PhotoGalleryPages from './PhotoGalleryPage'
import AcknowledgementsPage from './AcknowledgementsPage'
import BackCoverPage from './BackCoverPage'

export default function BrochureDocument({ data }) {
  const theme = getTheme(data.theme || 'blackGold')

  // Calculate page numbers
  let pageNum = 1
  // Cover = page 1
  pageNum++
  // Scripture = page 2
  // scripturePageNum = pageNum (unused)
  pageNum++
  // Officials = page 3
  const officialsPageNum = pageNum
  pageNum++
  // Order of service starts at page 4 (may span 2-3 pages)
  const serviceStartPage = pageNum
  const churchItems = data.orderOfService?.churchService?.length || 0
  const servicePages = Math.ceil(churchItems / 18) + 1 // +1 for burial page
  pageNum += servicePages
  // Biography starts after service
  const bioStartPage = pageNum
  const bioParagraphs = (data.biography || '').split('\n\n').filter(Boolean).length
  const bioPages = Math.max(1, Math.ceil(bioParagraphs / 6))
  pageNum += bioPages
  // Tributes
  const tributeStartPages = []
  const tributes = data.tributes || []
  tributes.forEach((t) => {
    tributeStartPages.push(pageNum)
    const tParas = (t.body || '').split('\n\n').filter(Boolean).length
    pageNum += Math.max(1, Math.ceil(tParas / 7))
  })
  // Gallery
  const galleryStartPage = pageNum
  const galleryPhotos = data.galleryPhotos || []
  const groups = {}
  galleryPhotos.forEach((p) => {
    const title = p.pageTitle || 'Photo Gallery'
    if (!groups[title]) groups[title] = []
    groups[title].push(p)
  })
  let galleryPages = 0
  Object.values(groups).forEach((g) => {
    galleryPages += Math.ceil(g.length / 4)
  })
  pageNum += galleryPages
  // Acknowledgements
  const ackPageNum = pageNum

  return (
    <Document
      title={`${data.title || ''} ${data.fullName || 'Memorial'} - Funeral Brochure`}
      author="FuneralPress"
    >
      <CoverPage data={data} theme={theme} />
      <ScripturePage data={data} theme={theme} />
      <OfficialsPage data={data} theme={theme} pageNum={String(officialsPageNum)} />
      <OrderOfServicePages data={data} theme={theme} startPageNum={serviceStartPage} />
      <BiographyPages data={data} theme={theme} startPageNum={bioStartPage} />
      {tributes.map((tribute, i) => (
        <TributePages
          key={tribute.id}
          tribute={tribute}
          theme={theme}
          startPageNum={tributeStartPages[i]}
        />
      ))}
      {galleryPages > 0 && (
        <PhotoGalleryPages data={data} theme={theme} startPageNum={galleryStartPage} />
      )}
      <AcknowledgementsPage data={data} theme={theme} pageNum={String(ackPageNum)} />
      <BackCoverPage data={data} theme={theme} />
    </Document>
  )
}
