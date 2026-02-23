import { thankYouThemes } from '../../utils/thankYouDefaultData'

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
        <div key={i} style={{ height: 2, backgroundColor: color, opacity, borderRadius: 1, width }} />
      ))}
    </div>
  )
}

function PhotoCircle({ color, size = 10 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', border: `1px solid ${color}`, opacity: 0.5 }} />
  )
}

// ─── Centered Layout ────────────────────────────────────────────────────────

function CenteredMockup({ t }) {
  return (
    <>
      {/* Header */}
      <div style={{ backgroundColor: t.headerBg, padding: '5% 4%', textAlign: 'center' }}>
        <div style={{ color: t.headerText, fontSize: '0.48em', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          THANK YOU
        </div>
        <div style={{ marginTop: '3%' }}><Divider color={t.accent} width="45%" /></div>
      </div>

      {/* Body */}
      <div style={{ backgroundColor: t.bodyBg, padding: '4% 8%', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
        {/* Circle photo */}
        <div style={{ width: '25%', aspectRatio: '1', borderRadius: '50%', border: `2px solid ${t.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)' }}>
          <PhotoCircle color={t.accent} size={8} />
        </div>

        <div style={{ color: t.nameText, fontSize: '0.45em', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '3%' }}>
          FULL NAME
        </div>

        <div style={{ color: t.bodyText, fontSize: '0.28em', opacity: 0.6, marginTop: '1%' }}>
          Born 1945 | Died 2024
        </div>

        <div style={{ marginTop: '2%', width: '50%' }}><Divider color={t.accent} /></div>

        {/* Message lines */}
        <div style={{ marginTop: '3%', width: '85%' }}>
          <PlaceholderLines color={t.bodyText} count={4} widths={['100%', '95%', '90%', '60%']} opacity={0.2} />
        </div>

        <div style={{ marginTop: '4%', width: '30%' }}><Divider color={t.accent} /></div>

        {/* Signature */}
        <div style={{ color: t.nameText, fontSize: '0.35em', fontWeight: 700, letterSpacing: '0.06em', marginTop: '3%' }}>
          The Family
        </div>

        <div style={{ color: t.bodyText, fontSize: '0.26em', opacity: 0.6, fontStyle: 'italic', marginTop: '1.5%' }}>
          God bless you.
        </div>
      </div>

      {/* Footer */}
      <div style={{ backgroundColor: t.footerBg, padding: '3% 4%', textAlign: 'center' }}>
        <div style={{ height: 2, backgroundColor: t.headerText, opacity: 0.3, borderRadius: 1, width: '45%', margin: '0 auto' }} />
      </div>
    </>
  )
}

// ─── Bordered Layout ────────────────────────────────────────────────────────

function BorderedMockup({ t }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      {/* Triple border */}
      <div style={{ position: 'absolute', top: '2%', left: '2%', right: '2%', bottom: '2%', border: `1.5px solid ${t.accent}`, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '3%', left: '3%', right: '3%', bottom: '3%', border: `0.5px solid ${t.accent}`, opacity: 0.4, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '3.5%', left: '3.5%', right: '3.5%', bottom: '3.5%', border: `0.5px solid ${t.accent}`, pointerEvents: 'none' }} />

      {/* Corner accents */}
      <div style={{ position: 'absolute', top: '2%', left: '2%', width: 10, height: 10, borderTop: `2px solid ${t.accent}`, borderLeft: `2px solid ${t.accent}` }} />
      <div style={{ position: 'absolute', top: '2%', right: '2%', width: 10, height: 10, borderTop: `2px solid ${t.accent}`, borderRight: `2px solid ${t.accent}` }} />
      <div style={{ position: 'absolute', bottom: '2%', left: '2%', width: 10, height: 10, borderBottom: `2px solid ${t.accent}`, borderLeft: `2px solid ${t.accent}` }} />
      <div style={{ position: 'absolute', bottom: '2%', right: '2%', width: 10, height: 10, borderBottom: `2px solid ${t.accent}`, borderRight: `2px solid ${t.accent}` }} />

      {/* Header */}
      <div style={{ backgroundColor: t.headerBg, padding: '5% 6%', textAlign: 'center', margin: '5% 5% 0' }}>
        <div style={{ color: t.headerText, fontSize: '0.45em', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          THANK YOU
        </div>
        <div style={{ marginTop: '3%' }}><Divider color={t.accent} width="40%" /></div>
      </div>

      {/* Photo + Name */}
      <div style={{ backgroundColor: t.bodyBg, padding: '3% 6%', margin: '0 5%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '28%', aspectRatio: '3/4', border: `2px solid ${t.accent}`, padding: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%', height: '100%', border: `1px solid ${t.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)' }}>
            <PhotoCircle color={t.accent} size={8} />
          </div>
        </div>
        <div style={{ color: t.nameText, fontSize: '0.42em', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '3%' }}>
          FULL NAME
        </div>
      </div>

      {/* Message */}
      <div style={{ padding: '2% 12%', margin: '0 5%', backgroundColor: t.bodyBg, textAlign: 'center', flex: 1 }}>
        <PlaceholderLines color={t.bodyText} count={4} widths={['100%', '95%', '85%', '55%']} opacity={0.2} />

        <div style={{ marginTop: '5%' }}><Divider color={t.accent} width="25%" /></div>

        <div style={{ color: t.detailsText || t.nameText, fontSize: '0.32em', fontWeight: 700, marginTop: '3%' }}>
          The Family
        </div>
      </div>

      {/* Footer */}
      <div style={{ backgroundColor: t.footerBg, padding: '2.5% 4%', textAlign: 'center', margin: '0 5% 5%' }}>
        <div style={{ height: 2, backgroundColor: t.headerText, opacity: 0.3, borderRadius: 1, width: '45%', margin: '0 auto' }} />
      </div>
    </div>
  )
}

// ─── Minimal Layout ─────────────────────────────────────────────────────────

function MinimalMockup({ t }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', backgroundColor: t.detailsBg }}>
      {/* Title */}
      <div style={{ padding: '10% 8% 3%', textAlign: 'center' }}>
        <div style={{ color: t.detailsText, fontSize: '0.5em', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase' }}>
          THANK YOU
        </div>
        <div style={{ height: 1, backgroundColor: t.accent, width: '25%', margin: '3% auto 0' }} />
      </div>

      {/* Circle photo */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3% 0' }}>
        <div style={{ width: '22%', aspectRatio: '1', borderRadius: '50%', border: `2px solid ${t.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.03)' }}>
          <PhotoCircle color={t.accent} size={8} />
        </div>
      </div>

      {/* Name */}
      <div style={{ textAlign: 'center', padding: '1% 8%' }}>
        <div style={{ color: t.nameText, fontSize: '0.42em', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          FULL NAME
        </div>
        <div style={{ color: t.detailsText, fontSize: '0.25em', opacity: 0.5, marginTop: '1%' }}>
          Born 1945 | Died 2024
        </div>
      </div>

      {/* Message */}
      <div style={{ padding: '3% 12%', textAlign: 'center', flex: 1 }}>
        <PlaceholderLines color={t.detailsText} count={4} widths={['100%', '95%', '90%', '55%']} opacity={0.15} />

        <div style={{ height: 0.5, backgroundColor: t.accent, width: '18%', margin: '5% auto' }} />

        <div style={{ color: t.detailsText, fontSize: '0.3em', fontWeight: 700, letterSpacing: '0.05em' }}>
          The Family
        </div>
        <div style={{ color: t.detailsText, fontSize: '0.24em', opacity: 0.5, fontStyle: 'italic', marginTop: '1.5%' }}>
          God bless you.
        </div>
      </div>

      {/* Footer */}
      <div style={{ backgroundColor: t.footerBg, padding: '3% 4%', textAlign: 'center' }}>
        <div style={{ height: 2, backgroundColor: t.headerText, opacity: 0.3, borderRadius: 1, width: '40%', margin: '0 auto' }} />
      </div>
    </div>
  )
}

// ─── PhotoLeft Layout ───────────────────────────────────────────────────────

function PhotoLeftMockup({ t }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
      {/* Left: photo */}
      <div style={{ width: '40%', backgroundColor: t.bodyBg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4%' }}>
        <div style={{ width: '70%', aspectRatio: '3/4', border: `2px solid ${t.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)' }}>
          <PhotoCircle color={t.accent} size={12} />
        </div>
        <div style={{ color: t.nameText, fontSize: '0.38em', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '6%', textAlign: 'center' }}>
          FULL NAME
        </div>
        <div style={{ color: t.bodyText, fontSize: '0.22em', opacity: 0.5, marginTop: '2%' }}>
          1945 - 2024
        </div>
      </div>

      {/* Right: text */}
      <div style={{ width: '60%', backgroundColor: t.detailsBg, padding: '6% 5%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ color: t.detailsText, fontSize: '0.42em', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
          THANK YOU
        </div>
        <div style={{ height: 1, backgroundColor: t.accent, width: '40%', marginTop: '3%', marginBottom: '5%' }} />

        <PlaceholderLines color={t.detailsText} count={4} widths={['100%', '95%', '90%', '60%']} opacity={0.15} />

        <div style={{ height: 0.5, backgroundColor: t.accent, width: '25%', marginTop: '6%', marginBottom: '4%' }} />

        <div style={{ color: t.detailsText, fontSize: '0.3em', fontWeight: 700, letterSpacing: '0.05em' }}>
          The Family
        </div>
        <div style={{ color: t.detailsText, fontSize: '0.24em', opacity: 0.5, fontStyle: 'italic', marginTop: '2%' }}>
          God bless you.
        </div>

        <div style={{ marginTop: 'auto' }}>
          <div style={{ height: 0.5, backgroundColor: t.accent, opacity: 0.3, marginBottom: '3%' }} />
          <div style={{ height: 2, backgroundColor: t.detailsText, opacity: 0.1, borderRadius: 1, width: '50%' }} />
        </div>
      </div>
    </div>
  )
}

// ─── PhotoRight Layout ──────────────────────────────────────────────────────

function PhotoRightMockup({ t }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
      {/* Left: text */}
      <div style={{ width: '60%', backgroundColor: t.detailsBg, padding: '6% 5%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ color: t.detailsText, fontSize: '0.42em', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
          THANK YOU
        </div>
        <div style={{ height: 1, backgroundColor: t.accent, width: '40%', marginTop: '3%', marginBottom: '5%' }} />

        <PlaceholderLines color={t.detailsText} count={4} widths={['100%', '95%', '90%', '60%']} opacity={0.15} />

        <div style={{ height: 0.5, backgroundColor: t.accent, width: '25%', marginTop: '6%', marginBottom: '4%' }} />

        <div style={{ color: t.detailsText, fontSize: '0.3em', fontWeight: 700, letterSpacing: '0.05em' }}>
          The Family
        </div>
        <div style={{ color: t.detailsText, fontSize: '0.24em', opacity: 0.5, fontStyle: 'italic', marginTop: '2%' }}>
          God bless you.
        </div>

        <div style={{ marginTop: 'auto' }}>
          <div style={{ height: 0.5, backgroundColor: t.accent, opacity: 0.3, marginBottom: '3%' }} />
          <div style={{ height: 2, backgroundColor: t.detailsText, opacity: 0.1, borderRadius: 1, width: '50%' }} />
        </div>
      </div>

      {/* Right: photo */}
      <div style={{ width: '40%', backgroundColor: t.bodyBg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4%' }}>
        <div style={{ width: '70%', aspectRatio: '3/4', border: `2px solid ${t.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)' }}>
          <PhotoCircle color={t.accent} size={12} />
        </div>
        <div style={{ color: t.nameText, fontSize: '0.38em', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '6%', textAlign: 'center' }}>
          FULL NAME
        </div>
        <div style={{ color: t.bodyText, fontSize: '0.22em', opacity: 0.5, marginTop: '2%' }}>
          1945 - 2024
        </div>
      </div>
    </div>
  )
}

// ─── Main export ────────────────────────────────────────────────────────────

export default function ThankYouMockup({ themeKey = 'ivoryGold', className = '' }) {
  const t = thankYouThemes[themeKey] || thankYouThemes.ivoryGold
  const layout = t.layout || 'centered'

  return (
    <div
      className={className}
      style={{
        aspectRatio: '7 / 10',
        backgroundColor: layout === 'photoLeft' || layout === 'photoRight' || layout === 'bordered' ? t.bodyBg : layout === 'minimal' ? t.detailsBg : t.detailsBg,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Playfair Display', Georgia, serif",
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {layout === 'centered' && <CenteredMockup t={t} />}
      {layout === 'bordered' && <BorderedMockup t={t} />}
      {layout === 'minimal' && <MinimalMockup t={t} />}
      {layout === 'photoLeft' && <PhotoLeftMockup t={t} />}
      {layout === 'photoRight' && <PhotoRightMockup t={t} />}
    </div>
  )
}
