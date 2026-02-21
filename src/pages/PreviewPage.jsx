import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer'
import { Link } from 'react-router-dom'
import { ArrowLeft, Download, Share2 } from 'lucide-react'
import { useBrochureStore } from '../stores/brochureStore'
import BrochureDocument from '../components/pdf/BrochureDocument'

export default function PreviewPage() {
  const store = useBrochureStore()

  const pdfData = {
    title: store.title,
    fullName: store.fullName,
    dateOfBirth: store.dateOfBirth,
    dateOfDeath: store.dateOfDeath,
    funeralDate: store.funeralDate,
    funeralTime: store.funeralTime,
    funeralVenue: store.funeralVenue,
    burialLocation: store.burialLocation,
    theme: store.theme,
    coverPhoto: store.coverPhoto,
    coverVerse: store.coverVerse,
    coverSubtitle: store.coverSubtitle,
    scriptureKey: store.scriptureKey,
    customScripture: store.customScripture,
    additionalVerse: store.additionalVerse,
    officials: store.officials,
    orderOfService: store.orderOfService,
    biography: store.biography,
    biographyPhotos: store.biographyPhotos,
    biographyPhotoCaptions: store.biographyPhotoCaptions,
    tributes: store.tributes,
    galleryPhotos: store.galleryPhotos,
    acknowledgements: store.acknowledgements,
    familySignature: store.familySignature,
    backCoverVerse: store.backCoverVerse,
    backCoverPhrase: store.backCoverPhrase,
    backCoverSubtext: store.backCoverSubtext,
    designerCredit: store.designerCredit,
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    } catch {
      alert('Could not copy link. Please copy the URL from the address bar.')
    }
  }

  return (
    <div className="h-screen flex flex-col bg-zinc-950">
      {/* Header */}
      <div className="h-12 flex items-center justify-between px-4 border-b border-zinc-800 shrink-0">
        <Link to="/editor" className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors text-sm">
          <ArrowLeft size={16} /> Back to Editor
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 border border-zinc-700 rounded-md transition-colors"
          >
            <Share2 size={14} /> Share
          </button>

          <PDFDownloadLink
            document={<BrochureDocument data={pdfData} />}
            fileName={`${pdfData.fullName?.replace(/\s+/g, '-') || 'Memorial'}-Funeral-Brochure.pdf`}
          >
            {({ loading }) => (
              <button
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-700 text-white text-xs font-medium rounded-md transition-colors"
              >
                <Download size={14} />
                {loading ? 'Preparing...' : 'Download PDF'}
              </button>
            )}
          </PDFDownloadLink>
        </div>
      </div>

      {/* Full-screen viewer */}
      <div className="flex-1">
        <PDFViewer style={{ width: '100%', height: '100%', border: 'none' }} showToolbar={true}>
          <BrochureDocument data={pdfData} />
        </PDFViewer>
      </div>
    </div>
  )
}
