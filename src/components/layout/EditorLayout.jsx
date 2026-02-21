import { useState, useCallback, useEffect, useRef } from 'react'
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer'
import { Download, ChevronDown, ChevronRight } from 'lucide-react'
import { useBrochureStore } from '../../stores/brochureStore'
import { useAutoSave } from '../../hooks/useAutoSave'
import BrochureDocument from '../pdf/BrochureDocument'

import BasicInfoForm from '../editor/BasicInfoForm'
import CoverForm from '../editor/CoverForm'
import ScriptureForm from '../editor/ScriptureForm'
import OfficialsForm from '../editor/OfficialsForm'
import OrderOfServiceForm from '../editor/OrderOfServiceForm'
import BiographyForm from '../editor/BiographyForm'
import TributesForm from '../editor/TributesForm'
import PhotoGalleryForm from '../editor/PhotoGalleryForm'
import AcknowledgementsForm from '../editor/AcknowledgementsForm'
import BackCoverForm from '../editor/BackCoverForm'

const sections = [
  { key: 'basic', title: 'Basic Information', icon: '1', component: BasicInfoForm },
  { key: 'cover', title: 'Cover Page', icon: '2', component: CoverForm },
  { key: 'scripture', title: 'Scripture Page', icon: '3', component: ScriptureForm },
  { key: 'officials', title: 'Programme Officials', icon: '4', component: OfficialsForm },
  { key: 'service', title: 'Order of Service', icon: '5', component: OrderOfServiceForm },
  { key: 'biography', title: 'Biography', icon: '6', component: BiographyForm },
  { key: 'tributes', title: 'Tributes', icon: '7', component: TributesForm },
  { key: 'gallery', title: 'Photo Gallery', icon: '8', component: PhotoGalleryForm },
  { key: 'ack', title: 'Acknowledgements', icon: '9', component: AcknowledgementsForm },
  { key: 'back', title: 'Back Cover', icon: '10', component: BackCoverForm },
]

function extractPdfData() {
  const state = useBrochureStore.getState()
  return {
    title: state.title,
    fullName: state.fullName,
    dateOfBirth: state.dateOfBirth,
    dateOfDeath: state.dateOfDeath,
    funeralDate: state.funeralDate,
    funeralTime: state.funeralTime,
    funeralVenue: state.funeralVenue,
    burialLocation: state.burialLocation,
    theme: state.theme,
    coverPhoto: state.coverPhoto,
    coverVerse: state.coverVerse,
    coverSubtitle: state.coverSubtitle,
    scriptureKey: state.scriptureKey,
    customScripture: state.customScripture,
    additionalVerse: state.additionalVerse,
    officials: state.officials,
    orderOfService: state.orderOfService,
    biography: state.biography,
    biographyPhotos: state.biographyPhotos,
    biographyPhotoCaptions: state.biographyPhotoCaptions,
    tributes: state.tributes,
    galleryPhotos: state.galleryPhotos,
    acknowledgements: state.acknowledgements,
    familySignature: state.familySignature,
    backCoverVerse: state.backCoverVerse,
    backCoverPhrase: state.backCoverPhrase,
    backCoverSubtext: state.backCoverSubtext,
    designerCredit: state.designerCredit,
  }
}

export default function EditorLayout() {
  useAutoSave()
  const [openSections, setOpenSections] = useState(['basic'])
  const [pdfData, setPdfData] = useState(() => extractPdfData())
  const timerRef = useRef(null)

  // Subscribe to store changes with debounce
  useEffect(() => {
    const unsub = useBrochureStore.subscribe(() => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        setPdfData(extractPdfData())
      }, 600)
    })
    return () => {
      unsub()
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const toggleSection = (key) => {
    setOpenSections((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
      {/* Left Panel - Form Editor */}
      <div className="w-full lg:w-[420px] xl:w-[460px] border-r border-zinc-800 overflow-y-auto bg-zinc-950">
        <div className="p-4">
          <h2 className="text-xs text-zinc-500 uppercase tracking-wider mb-3 font-medium">Brochure Editor</h2>

          <div className="space-y-1">
            {sections.map(({ key, title, icon, component: Component }) => (
              <div key={key} className="border border-zinc-800 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection(key)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-zinc-900/50 transition-colors"
                >
                  <span className="w-5 h-5 rounded-full bg-amber-600/20 text-amber-500 text-[10px] font-bold flex items-center justify-center shrink-0">
                    {icon}
                  </span>
                  <span className="text-sm text-zinc-300 flex-1">{title}</span>
                  {openSections.includes(key)
                    ? <ChevronDown size={14} className="text-zinc-500" />
                    : <ChevronRight size={14} className="text-zinc-500" />
                  }
                </button>
                {openSections.includes(key) && (
                  <div className="px-3 pb-4 pt-2 border-t border-zinc-800/50">
                    <Component />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - PDF Preview */}
      <div className="flex-1 flex flex-col bg-zinc-900 min-h-0">
        {/* Preview header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-950 shrink-0">
          <span className="text-xs text-zinc-500 uppercase tracking-wider">Live Preview</span>
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

        {/* PDF Viewer */}
        <div className="flex-1 min-h-0">
          <PDFViewer
            style={{ width: '100%', height: '100%', border: 'none' }}
            showToolbar={true}
          >
            <BrochureDocument data={pdfData} />
          </PDFViewer>
        </div>
      </div>
    </div>
  )
}
