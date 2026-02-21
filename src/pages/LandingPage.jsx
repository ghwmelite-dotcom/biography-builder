import { Link, useNavigate } from 'react-router-dom'
import { Plus, BookOpen, Trash2, FileText, ArrowRight } from 'lucide-react'
import { useBrochureStore } from '../stores/brochureStore'

export default function LandingPage() {
  const navigate = useNavigate()
  const store = useBrochureStore()
  const brochures = store.brochuresList

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

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      {/* Hero */}
      <div className="max-w-4xl mx-auto px-6 pt-20 pb-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-600/10 border border-amber-600/20 rounded-full mb-6">
            <BookOpen size={14} className="text-amber-500" />
            <span className="text-xs text-amber-400 tracking-wide">Funeral Brochure Builder</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Create Beautiful<br />
            <span className="text-amber-500">Memorial Brochures</span>
          </h1>

          <p className="text-zinc-400 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            Design premium funeral brochures with our elegant editor. Choose from professional themes,
            add tributes, photos, and order of service — then download as a print-ready PDF.
          </p>

          <button
            onClick={handleNew}
            className="inline-flex items-center gap-2 px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-lg transition-colors text-sm"
          >
            <Plus size={18} />
            Create New Brochure
          </button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
          {[
            { title: 'Live Preview', desc: 'See your brochure update in real-time as you type' },
            { title: 'Premium Themes', desc: 'Black & Gold, White & Navy, or Burgundy & Cream' },
            { title: 'Print-Ready PDF', desc: 'Download high-quality A4 PDFs ready for professional printing' },
          ].map((f, i) => (
            <div key={i} className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl">
              <h3 className="text-sm font-semibold text-zinc-200 mb-1">{f.title}</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Saved brochures */}
        {brochures.length > 0 && (
          <div>
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

        {/* Sample preview mockup */}
        <div className="mt-16 text-center">
          <p className="text-xs text-zinc-600 mb-4 uppercase tracking-wider">Preview</p>
          <div className="mx-auto max-w-xs bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-2xl">
            <div className="aspect-[3/4] bg-[#0A0A0A] rounded-lg border border-[#C9A84C]/30 flex flex-col items-center justify-center p-8">
              <div className="text-[#C9A84C] text-xs tracking-[4px] uppercase mb-2">Celebration of Life</div>
              <div className="text-[#C9A84C]/60 text-[10px] italic mb-4">In Loving Memory of</div>
              <div className="w-16 h-20 rounded-full border border-[#C9A84C]/40 mb-4 flex items-center justify-center">
                <span className="text-[#C9A84C]/30 text-lg">✝</span>
              </div>
              <div className="text-[#C9A84C] text-sm font-bold tracking-wider text-center leading-relaxed">
                FULL NAME
              </div>
              <div className="text-[#E8D48B]/50 text-[9px] mt-2">1948 — 2025</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
