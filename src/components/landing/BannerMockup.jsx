import { bannerThemes } from '../../utils/bannerDefaultData'

function Divider({ color, width = '50%' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width, margin: '0 auto' }}>
      <div style={{ flex: 1, height: 0.5, backgroundColor: color }} />
      <div style={{ width: 4, height: 4, backgroundColor: color, transform: 'rotate(45deg)', margin: '0 3px', flexShrink: 0 }} />
      <div style={{ flex: 1, height: 0.5, backgroundColor: color }} />
    </div>
  )
}

function PlaceholderLines({ color, count = 3, widths, opacity = 0.15 }) {
  const w = widths || Array(count).fill('85%')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3%' }}>
      {w.map((width, i) => (
        <div key={i} style={{ height: 1.5, backgroundColor: color, opacity, borderRadius: 1, width }} />
      ))}
    </div>
  )
}

function PhotoCircle({ color, size = 10 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', border: `1px solid ${color}`, opacity: 0.5 }} />
  )
}

// ─── Classic Layout ──────────────────────────────────────────────────────────
// Photo top, name band, scripture, family text

function ClassicMockup({ t }) {
  return (
    <>
      {/* Header */}
      <div style={{ backgroundColor: t.headerBg, padding: '5% 6%', textAlign: 'center' }}>
        <div style={{ color: t.headerText, fontSize: '0.38em', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
          IN LOVING MEMORY
        </div>
        <div style={{ marginTop: '3%' }}><Divider color={t.accent} width="50%" /></div>
      </div>

      {/* Photo */}
      <div style={{ backgroundColor: t.bodyBg, padding: '4% 0', display: 'flex', justifyContent: 'center' }}>
        <div style={{
          width: '55%', aspectRatio: '4/5', border: `2px solid ${t.accent}`, padding: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: '100%', height: '100%', border: `1px solid ${t.accent}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(255,255,255,0.05)',
          }}>
            <PhotoCircle color={t.accent} size={12} />
          </div>
        </div>
      </div>

      {/* Name Band */}
      <div style={{ backgroundColor: t.accent, padding: '3% 4%', textAlign: 'center' }}>
        <div style={{ color: t.badgeText, fontSize: '0.4em', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          FULL NAME
        </div>
      </div>

      {/* Dates */}
      <div style={{ backgroundColor: t.bodyBg, padding: '2% 6%', textAlign: 'center' }}>
        <div style={{ color: t.bodyText, fontSize: '0.22em', opacity: 0.6 }}>1948 — 2025</div>
      </div>

      {/* Scripture */}
      <div style={{ backgroundColor: t.bodyBg, padding: '3% 8%', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <PlaceholderLines color={t.bodyText} count={3} widths={['90%', '95%', '70%']} opacity={0.25} />
        <div style={{ marginTop: '4%' }}>
          <div style={{ height: 1.5, backgroundColor: t.accent, opacity: 0.6, borderRadius: 1, width: '40%', margin: '0 auto' }} />
        </div>
      </div>

      {/* Divider */}
      <div style={{ padding: '2% 0' }}><Divider color={t.accent} width="30%" /></div>

      {/* Family text */}
      <div style={{ backgroundColor: t.bodyBg, padding: '2% 8%', textAlign: 'center' }}>
        <PlaceholderLines color={t.bodyText} count={2} widths={['80%', '55%']} opacity={0.2} />
      </div>

      {/* Footer */}
      <div style={{ backgroundColor: t.footerBg, padding: '3% 4%', textAlign: 'center' }}>
        <div style={{ height: 1.5, backgroundColor: t.headerText, opacity: 0.3, borderRadius: 1, width: '50%', margin: '0 auto' }} />
      </div>
    </>
  )
}

// ─── Elegant Layout ──────────────────────────────────────────────────────────
// Ornamental corners, framed photo, centered scripture

function ElegantMockup({ t }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', backgroundColor: t.detailsBg }}>
      {/* Corner accents */}
      <div style={{ position: 'absolute', top: '2%', left: '3%', width: 10, height: 10, borderTop: `1.5px solid ${t.accent}`, borderLeft: `1.5px solid ${t.accent}` }} />
      <div style={{ position: 'absolute', top: '2%', right: '3%', width: 10, height: 10, borderTop: `1.5px solid ${t.accent}`, borderRight: `1.5px solid ${t.accent}` }} />
      <div style={{ position: 'absolute', bottom: '2%', left: '3%', width: 10, height: 10, borderBottom: `1.5px solid ${t.accent}`, borderLeft: `1.5px solid ${t.accent}` }} />
      <div style={{ position: 'absolute', bottom: '2%', right: '3%', width: 10, height: 10, borderBottom: `1.5px solid ${t.accent}`, borderRight: `1.5px solid ${t.accent}` }} />

      {/* Header */}
      <div style={{ backgroundColor: t.headerBg, padding: '5% 6%', textAlign: 'center', margin: '4% 6% 0' }}>
        <div style={{ color: t.headerText, fontSize: '0.35em', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
          IN LOVING MEMORY
        </div>
        <div style={{ marginTop: '3%' }}><Divider color={t.accent} width="45%" /></div>
      </div>

      {/* Photo */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4% 0', margin: '0 6%', backgroundColor: t.bodyBg }}>
        <div style={{
          width: '50%', aspectRatio: '4/5', border: `1.5px solid ${t.accent}`, padding: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)',
        }}>
          <PhotoCircle color={t.accent} size={10} />
        </div>
      </div>

      {/* Name */}
      <div style={{ textAlign: 'center', padding: '1% 6%', backgroundColor: t.bodyBg, margin: '0 6%' }}>
        <Divider color={t.accent} width="40%" />
        <div style={{ color: t.accent, fontSize: '0.4em', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '2%' }}>
          FULL NAME
        </div>
        <div style={{ color: t.bodyText, fontSize: '0.2em', opacity: 0.6, marginTop: '1%' }}>1948 — 2025</div>
      </div>

      {/* Scripture */}
      <div style={{ padding: '3% 10%', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', backgroundColor: t.bodyBg, margin: '0 6%' }}>
        <PlaceholderLines color={t.bodyText} count={3} widths={['88%', '92%', '65%']} opacity={0.25} />
        <div style={{ marginTop: '4%' }}>
          <div style={{ height: 1.5, backgroundColor: t.accent, opacity: 0.6, borderRadius: 1, width: '35%', margin: '0 auto' }} />
        </div>
      </div>

      {/* Divider */}
      <div style={{ padding: '1% 0', margin: '0 6%', backgroundColor: t.bodyBg }}><Divider color={t.accent} width="25%" /></div>

      {/* Family text */}
      <div style={{ padding: '2% 10%', textAlign: 'center', backgroundColor: t.bodyBg, margin: '0 6%' }}>
        <PlaceholderLines color={t.bodyText} count={2} widths={['75%', '50%']} opacity={0.2} />
      </div>

      {/* Footer */}
      <div style={{ backgroundColor: t.footerBg, padding: '3% 4%', textAlign: 'center', margin: '0 6% 4%' }}>
        <div style={{ height: 1.5, backgroundColor: t.headerText, opacity: 0.3, borderRadius: 1, width: '45%', margin: '0 auto' }} />
      </div>
    </div>
  )
}

// ─── Modern Layout ───────────────────────────────────────────────────────────
// Accent bars on sides, left-aligned name, scripture with left border

function ModernMockup({ t }) {
  return (
    <>
      {/* Header with accent bars */}
      <div style={{ display: 'flex', backgroundColor: t.headerBg }}>
        <div style={{ width: 2, backgroundColor: t.accent }} />
        <div style={{ flex: 1, padding: '5% 5%', textAlign: 'center' }}>
          <div style={{ color: t.headerText, fontSize: '0.35em', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
            IN LOVING MEMORY
          </div>
          <div style={{ marginTop: '3%' }}><Divider color={t.accent} width="45%" /></div>
        </div>
        <div style={{ width: 2, backgroundColor: t.accent }} />
      </div>

      {/* Photo */}
      <div style={{ backgroundColor: t.bodyBg, padding: '4%', display: 'flex', justifyContent: 'center' }}>
        <div style={{
          width: '55%', aspectRatio: '4/5', border: `2px solid ${t.accent}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)',
        }}>
          <PhotoCircle color={t.accent} size={12} />
        </div>
      </div>

      {/* Name left-aligned */}
      <div style={{ backgroundColor: t.bodyBg, padding: '2% 8%' }}>
        <div style={{ color: t.accent, fontSize: '0.38em', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          FULL NAME
        </div>
        <div style={{ color: t.bodyText, fontSize: '0.2em', opacity: 0.6, marginTop: '1%' }}>1948 — 2025</div>
        <div style={{ height: 1, backgroundColor: t.accent, width: '35%', marginTop: '3%' }} />
      </div>

      {/* Scripture with left border */}
      <div style={{ backgroundColor: t.bodyBg, padding: '3% 8%', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ borderLeft: `2px solid ${t.accent}`, paddingLeft: '5%' }}>
          <PlaceholderLines color={t.bodyText} count={3} widths={['90%', '95%', '65%']} opacity={0.25} />
          <div style={{ marginTop: '4%' }}>
            <div style={{ height: 1.5, backgroundColor: t.accent, opacity: 0.6, borderRadius: 1, width: '40%' }} />
          </div>
        </div>
      </div>

      {/* Accent strip */}
      <div style={{ height: 2, backgroundColor: t.accent }} />

      {/* Family text */}
      <div style={{ backgroundColor: t.bodyBg, padding: '3% 8%' }}>
        <PlaceholderLines color={t.bodyText} count={2} widths={['80%', '55%']} opacity={0.2} />
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', backgroundColor: t.footerBg }}>
        <div style={{ width: 2, backgroundColor: t.accent }} />
        <div style={{ flex: 1, padding: '3% 4%', textAlign: 'center' }}>
          <div style={{ height: 1.5, backgroundColor: t.headerText, opacity: 0.3, borderRadius: 1, width: '50%', margin: '0 auto' }} />
        </div>
        <div style={{ width: 2, backgroundColor: t.accent }} />
      </div>
    </>
  )
}

// ─── Heritage Layout ─────────────────────────────────────────────────────────
// Kente accent strips, warm tones, bold name band

function HeritageMockup({ t }) {
  return (
    <>
      {/* Kente accent strip */}
      <div style={{ height: 3, backgroundColor: t.accent }} />

      {/* Header */}
      <div style={{ backgroundColor: t.headerBg, padding: '5% 5%', textAlign: 'center' }}>
        <div style={{ color: t.headerText, fontSize: '0.38em', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          IN LOVING MEMORY
        </div>
        <div style={{ marginTop: '3%' }}><Divider color={t.accent} width="35%" /></div>
      </div>
      <div style={{ height: 1.5, backgroundColor: t.accent }} />

      {/* Photo with double border */}
      <div style={{ backgroundColor: t.bodyBg, padding: '4%', display: 'flex', justifyContent: 'center' }}>
        <div style={{ border: `2px solid ${t.accent}`, padding: 2 }}>
          <div style={{
            width: '100%', aspectRatio: '4/5', border: `1px solid ${t.accent}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(255,255,255,0.05)', padding: '15% 20%',
          }}>
            <PhotoCircle color={t.accent} size={12} />
          </div>
        </div>
      </div>

      {/* Name band */}
      <div style={{ backgroundColor: t.accent, padding: '3% 4%', textAlign: 'center' }}>
        <div style={{ color: t.badgeText, fontSize: '0.4em', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          FULL NAME
        </div>
      </div>

      {/* Dates */}
      <div style={{ backgroundColor: t.bodyBg, padding: '2% 6%', textAlign: 'center' }}>
        <div style={{ color: t.bodyText, fontSize: '0.2em', opacity: 0.6 }}>1948 — 2025</div>
      </div>

      {/* Scripture */}
      <div style={{ backgroundColor: t.bodyBg, padding: '3% 8%', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <PlaceholderLines color={t.bodyText} count={3} widths={['88%', '92%', '68%']} opacity={0.25} />
        <div style={{ marginTop: '4%' }}>
          <div style={{ height: 1.5, backgroundColor: t.accent, opacity: 0.6, borderRadius: 1, width: '38%', margin: '0 auto' }} />
        </div>
      </div>

      {/* Divider */}
      <div style={{ padding: '1% 0' }}><Divider color={t.accent} width="30%" /></div>

      {/* Family text */}
      <div style={{ backgroundColor: t.bodyBg, padding: '2% 8%', textAlign: 'center' }}>
        <PlaceholderLines color={t.bodyText} count={2} widths={['78%', '52%']} opacity={0.2} />
      </div>

      {/* Bottom accent strips */}
      <div style={{ height: 1.5, backgroundColor: t.accent }} />
      <div style={{ backgroundColor: t.footerBg, padding: '3% 4%', textAlign: 'center' }}>
        <div style={{ height: 1.5, backgroundColor: t.headerText, opacity: 0.3, borderRadius: 1, width: '50%', margin: '0 auto' }} />
      </div>
      <div style={{ height: 3, backgroundColor: t.accent }} />
    </>
  )
}

// ─── Centered Layout ─────────────────────────────────────────────────────────
// All centered, circle photo, elegant spacing

function CenteredMockup({ t }) {
  return (
    <>
      {/* Header */}
      <div style={{ backgroundColor: t.headerBg, padding: '5% 5%', textAlign: 'center' }}>
        <div style={{ color: t.headerText, fontSize: '0.35em', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
          IN LOVING MEMORY
        </div>
        <div style={{ marginTop: '3%' }}><Divider color={t.accent} width="45%" /></div>
      </div>

      {/* Circle photo */}
      <div style={{ backgroundColor: t.bodyBg, padding: '4% 0', display: 'flex', justifyContent: 'center' }}>
        <div style={{
          width: '40%', aspectRatio: '1', borderRadius: '50%', border: `2px solid ${t.accent}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)',
        }}>
          <PhotoCircle color={t.accent} size={10} />
        </div>
      </div>

      {/* Name + dates */}
      <div style={{ backgroundColor: t.bodyBg, padding: '1% 6%', textAlign: 'center' }}>
        <div style={{ color: t.accent, fontSize: '0.4em', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          FULL NAME
        </div>
        <div style={{ color: t.bodyText, fontSize: '0.2em', opacity: 0.6, marginTop: '1%' }}>1948 — 2025</div>
        <div style={{ marginTop: '3%' }}><Divider color={t.accent} width="35%" /></div>
      </div>

      {/* Scripture */}
      <div style={{ backgroundColor: t.bodyBg, padding: '3% 10%', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
        <PlaceholderLines color={t.bodyText} count={3} widths={['88%', '92%', '65%']} opacity={0.25} />
        <div style={{ marginTop: '4%' }}>
          <div style={{ height: 1.5, backgroundColor: t.accent, opacity: 0.6, borderRadius: 1, width: '35%', margin: '0 auto' }} />
        </div>
      </div>

      {/* Accent strip */}
      <div style={{ height: 2, backgroundColor: t.accent }} />

      {/* Family text */}
      <div style={{ backgroundColor: t.bodyBg, padding: '3% 10%', textAlign: 'center' }}>
        <PlaceholderLines color={t.bodyText} count={2} widths={['78%', '52%']} opacity={0.2} />
      </div>

      {/* Footer */}
      <div style={{ backgroundColor: t.footerBg, padding: '3% 4%', textAlign: 'center' }}>
        <div style={{ height: 1.5, backgroundColor: t.headerText, opacity: 0.3, borderRadius: 1, width: '45%', margin: '0 auto' }} />
      </div>
    </>
  )
}

// ─── Main export ─────────────────────────────────────────────────────────────

export default function BannerMockup({ themeKey = 'royalBlue', className = '' }) {
  const t = bannerThemes[themeKey] || bannerThemes.royalBlue
  const layout = t.layout || 'classic'

  return (
    <div
      className={className}
      style={{
        aspectRatio: '2 / 5',
        backgroundColor: layout === 'elegant' ? t.detailsBg : t.bodyBg,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Playfair Display', Georgia, serif",
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {layout === 'classic' && <ClassicMockup t={t} />}
      {layout === 'elegant' && <ElegantMockup t={t} />}
      {layout === 'heritage' && <HeritageMockup t={t} />}
      {layout === 'centered' && <CenteredMockup t={t} />}
      {layout === 'modern' && <ModernMockup t={t} />}
    </div>
  )
}
