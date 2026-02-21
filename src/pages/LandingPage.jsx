import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  BookOpen,
  Trash2,
  FileText,
  ArrowRight,
  Eye,
  Palette,
  Printer,
  Image,
  Save,
  Undo2,
  Download,
  Heart,
  Church,
  Flower2,
  Cross,
} from 'lucide-react'
import { useBrochureStore } from '../stores/brochureStore'
import { usePosterStore } from '../stores/posterStore'
import { themes } from '../utils/themes'
import BrochureMockup from '../components/landing/BrochureMockup'
import PosterMockup from '../components/landing/PosterMockup'
import ExampleBrochureDialog from '../components/landing/ExampleBrochureDialog'
import ThemePreviewCard from '../components/landing/ThemePreviewCard'

const FEATURES = [
  { icon: Eye, title: 'Live Preview', desc: 'See your brochure update in real-time as you type and edit' },
  { icon: Palette, title: 'Premium Themes', desc: 'Black & Gold, White & Navy, or Burgundy & Cream' },
  { icon: Printer, title: 'Print-Ready PDF', desc: 'Download high-quality A4 PDFs ready for professional printing' },
  { icon: Image, title: 'Drag & Drop Photos', desc: 'Add portrait photos, gallery images, and biography pictures' },
  { icon: Save, title: 'Auto-Save', desc: 'Your work is automatically saved to the browser as you go' },
  { icon: Undo2, title: 'Undo / Redo', desc: 'Made a mistake? Step back and forward through your edits' },
  { icon: Download, title: 'Export & Import', desc: 'Export your brochure as JSON and import it on another device' },
  { icon: Heart, title: 'Beautiful Tributes', desc: 'Add multiple tribute sections with opening verses and closing lines' },
]

const TEMPLATES = [
  {
    id: 'full-service',
    icon: Church,
    title: 'Full Service',
    desc: 'Complete funeral brochure with order of service, tributes, biography, photo gallery, and acknowledgements.',
  },
  {
    id: 'simple-memorial',
    icon: Flower2,
    title: 'Simple Memorial',
    desc: 'A streamlined brochure with cover, tribute, and back cover — perfect for a smaller ceremony.',
  },
  {
    id: 'graveside-only',
    icon: Cross,
    title: 'Graveside Only',
    desc: 'A minimal brochure designed for graveside services with essential details and a personal touch.',
  },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const store = useBrochureStore()
  const brochures = store.brochuresList
  const posterStore = usePosterStore()
  const posters = posterStore.postersList
  const [exampleOpen, setExampleOpen] = useState(false)

  const handleNew = () => {
    store.newBrochure()
    navigate('/editor')
  }

  const handleLoad = (id) => {
    store.loadBrochure(id)
    navigate('/editor')
  }

  const handleDelete = (e, id) => {
    e.stopPropagation()
    if (confirm('Delete this brochure?')) {
      store.deleteBrochure(id)
    }
  }

  const handleThemeSelect = (themeKey) => {
    store.newBrochure()
    store.updateField('theme', themeKey)
    navigate('/editor')
  }

  const handleTemplateSelect = () => {
    store.newBrochure()
    navigate('/editor')
  }

  const handleNewPoster = () => {
    posterStore.newPoster()
    navigate('/poster-editor')
  }

  const handleLoadPoster = (id) => {
    posterStore.loadPoster(id)
    navigate('/poster-editor')
  }

  const handleDeletePoster = (e, id) => {
    e.stopPropagation()
    if (confirm('Delete this poster?')) {
      posterStore.deletePoster(id)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 pt-20 pb-16">
        <div className="flex flex-col lg:flex-row items-center gap-12 mb-20">
          {/* Left: text content */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-600/10 border border-amber-600/20 rounded-full mb-6">
              <BookOpen size={14} className="text-amber-500" />
              <span className="text-xs text-amber-400 tracking-wide">Funeral Brochure Builder</span>
            </div>

            <h1
              className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Create Beautiful<br />
              <span className="text-amber-500">Memorial Brochures</span>
            </h1>

            <p className="text-zinc-400 text-lg max-w-2xl mb-8 leading-relaxed">
              Design premium funeral brochures with our elegant editor. Choose from professional themes,
              add tributes, photos, and order of service — then download as a print-ready PDF.
            </p>

            <div className="flex flex-wrap items-center gap-3 justify-center lg:justify-start">
              <button
                onClick={handleNew}
                className="inline-flex items-center gap-2 px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-lg transition-colors text-sm"
              >
                <Plus size={18} />
                Create New Brochure
              </button>
              <button
                onClick={() => setExampleOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 font-medium rounded-lg transition-colors text-sm"
              >
                <Eye size={18} />
                See Example
              </button>
            </div>
          </div>

          {/* Right: hero brochure mockup */}
          <div className="flex-shrink-0 w-full max-w-[280px] lg:max-w-[300px]">
            <div className="rounded-xl overflow-hidden shadow-2xl shadow-amber-900/10 ring-1 ring-zinc-800">
              <BrochureMockup themeKey="blackGold" className="text-[10px]" />
            </div>
          </div>
        </div>

        {/* Choose Your Product */}
        <div className="mb-20">
          <div className="text-center mb-8">
            <p className="text-xs text-amber-500/80 uppercase tracking-wider mb-2 font-medium">Two Beautiful Products</p>
            <h2
              className="text-2xl md:text-3xl font-bold text-white"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              What Would You Like to Create?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Brochure Card */}
            <button
              onClick={handleNew}
              className="group text-left p-6 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-amber-600/40 transition-all"
            >
              <div className="w-full max-w-[160px] mx-auto mb-4 rounded-lg overflow-hidden shadow-lg ring-1 ring-zinc-800">
                <BrochureMockup themeKey="blackGold" className="text-[8px]" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-200 mb-1 group-hover:text-amber-400 transition-colors" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Funeral Brochure
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed mb-3">
                Multi-page A4 brochure with cover, order of service, tributes, biography, photo gallery, and acknowledgements.
              </p>
              <span className="inline-flex items-center gap-1 text-[10px] text-amber-500/70 group-hover:text-amber-400 transition-colors uppercase tracking-wider font-medium">
                Create Brochure <ArrowRight size={10} />
              </span>
            </button>

            {/* Poster Card */}
            <button
              onClick={handleNewPoster}
              className="group text-left p-6 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-amber-600/40 transition-all"
            >
              <div className="w-full max-w-[160px] mx-auto mb-4 rounded-lg overflow-hidden shadow-lg ring-1 ring-zinc-800">
                <PosterMockup themeKey="royalBlue" className="text-[8px]" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-200 mb-1 group-hover:text-amber-400 transition-colors" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Obituary Poster
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed mb-3">
                Single-page A3 poster with photo, family announcement, funeral arrangements, and family details.
              </p>
              <span className="inline-flex items-center gap-1 text-[10px] text-amber-500/70 group-hover:text-amber-400 transition-colors uppercase tracking-wider font-medium">
                Create Poster <ArrowRight size={10} />
              </span>
            </button>
          </div>
        </div>

        {/* Template Selection */}
        <div className="mb-20">
          <div className="text-center mb-8">
            <p className="text-xs text-amber-500/80 uppercase tracking-wider mb-2 font-medium">Get Started Quickly</p>
            <h2
              className="text-2xl md:text-3xl font-bold text-white"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Choose a Template
            </h2>
            <p className="text-zinc-500 text-sm mt-2 max-w-lg mx-auto">
              Pick a starting point and customize every detail in the editor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TEMPLATES.map((tmpl) => {
              const Icon = tmpl.icon
              return (
                <button
                  key={tmpl.id}
                  onClick={handleTemplateSelect}
                  className="group flex flex-col items-center text-center p-6 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-amber-600/40 hover:bg-zinc-900/80 transition-all duration-200"
                >
                  <div className="w-12 h-12 rounded-full bg-amber-600/10 border border-amber-600/20 flex items-center justify-center mb-4 group-hover:bg-amber-600/20 transition-colors">
                    <Icon size={22} className="text-amber-500" />
                  </div>
                  <h3 className="text-sm font-semibold text-zinc-200 mb-1 group-hover:text-amber-400 transition-colors">
                    {tmpl.title}
                  </h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">{tmpl.desc}</p>
                  <span className="inline-flex items-center gap-1 mt-3 text-[10px] text-amber-500/70 group-hover:text-amber-400 transition-colors uppercase tracking-wider font-medium">
                    Use Template <ArrowRight size={10} />
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Saved brochures */}
        {brochures.length > 0 && (
          <div className="mb-20">
            <h2 className="text-sm text-zinc-400 uppercase tracking-wider mb-4 font-medium">
              Saved Brochures
            </h2>
            <div className="space-y-2">
              {brochures.map((b) => (
                <div
                  key={b.id}
                  onClick={() => handleLoad(b.id)}
                  className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-lg cursor-pointer hover:border-zinc-700 hover:bg-zinc-900/80 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <FileText size={18} className="text-amber-500/60" />
                    <div>
                      <p className="text-sm text-zinc-300">{b.name || 'Untitled Brochure'}</p>
                      <p className="text-[10px] text-zinc-600">
                        Last saved: {new Date(b.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleDelete(e, b.id)}
                      className="p-2 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                    <ArrowRight size={16} className="text-zinc-600 group-hover:text-amber-500 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Saved Posters */}
        {posters.length > 0 && (
          <div className="mb-20">
            <h2 className="text-sm text-zinc-400 uppercase tracking-wider mb-4 font-medium">
              Saved Posters
            </h2>
            <div className="space-y-2">
              {posters.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleLoadPoster(p.id)}
                  className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-lg cursor-pointer hover:border-zinc-700 hover:bg-zinc-900/80 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <FileText size={18} className="text-amber-500/60" />
                    <div>
                      <p className="text-sm text-zinc-300">{p.name || 'Untitled Poster'}</p>
                      <p className="text-[10px] text-zinc-600">
                        Last saved: {new Date(p.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleDeletePoster(e, p.id)}
                      className="p-2 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                    <ArrowRight size={16} className="text-zinc-600 group-hover:text-amber-500 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mb-20">
          <div className="text-center mb-8">
            <p className="text-xs text-amber-500/80 uppercase tracking-wider mb-2 font-medium">Everything You Need</p>
            <h2
              className="text-2xl md:text-3xl font-bold text-white"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Powerful Features
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => {
              const Icon = f.icon
              return (
                <div key={i} className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl">
                  <div className="w-9 h-9 rounded-lg bg-amber-600/10 border border-amber-600/20 flex items-center justify-center mb-3">
                    <Icon size={16} className="text-amber-500" />
                  </div>
                  <h3 className="text-sm font-semibold text-zinc-200 mb-1">{f.title}</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Choose Your Theme */}
        <div className="mb-10">
          <div className="text-center mb-8">
            <p className="text-xs text-amber-500/80 uppercase tracking-wider mb-2 font-medium">Personalize Your Design</p>
            <h2
              className="text-2xl md:text-3xl font-bold text-white"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Choose Your Theme
            </h2>
            <p className="text-zinc-500 text-sm mt-2 max-w-lg mx-auto">
              Each theme is carefully crafted for a dignified, professional look. Pick one to get started.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {Object.keys(themes).map((key) => (
              <ThemePreviewCard
                key={key}
                themeKey={key}
                onClick={() => handleThemeSelect(key)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Example brochure dialog */}
      <ExampleBrochureDialog open={exampleOpen} onOpenChange={setExampleOpen} />
    </div>
  )
}
