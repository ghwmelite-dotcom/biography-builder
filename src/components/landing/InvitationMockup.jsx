import { invitationThemes } from '../../utils/invitationDefaultData'

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

function EventBlock({ color, accent, style = 'card' }) {
  if (style === 'card') {
    return (
      <div style={{ border: `1px solid ${accent}`, padding: '3%', borderRadius: 2, marginBottom: '3%' }}>
        <div style={{ height: 2, backgroundColor: accent, opacity: 0.6, borderRadius: 1, width: '65%', marginBottom: '3%' }} />
        <PlaceholderLines color={color} count={2} widths={['80%', '55%']} opacity={0.1} />
      </div>
    )
  }
  if (style === 'timeline') {
    return (
      <div style={{ display: 'flex', marginBottom: '4%' }}>
        <div style={{ width: 2, backgroundColor: accent, marginRight: '4%', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 2, backgroundColor: accent, opacity: 0.5, borderRadius: 1, width: '60%', marginBottom: '3%' }} />
          <PlaceholderLines color={color} count={2} widths={['85%', '55%']} opacity={0.1} />
        </div>
      </div>
    )
  }
  if (style === 'left-border') {
    return (
      <div style={{ borderLeft: `2px solid ${accent}`, paddingLeft: '4%', marginBottom: '4%' }}>
        <div style={{ height: 2, backgroundColor: color, opacity: 0.15, borderRadius: 1, width: '55%', marginBottom: '3%' }} />
        <PlaceholderLines color={color} count={2} widths={['80%', '50%']} opacity={0.1} />
      </div>
    )
  }
  // divider style
  return (
    <div style={{ textAlign: 'center', marginBottom: '4%' }}>
      <div style={{ height: 2, backgroundColor: accent, opacity: 0.5, borderRadius: 1, width: '50%', margin: '0 auto 3%' }} />
      <PlaceholderLines color={color} count={2} widths={['70%', '45%']} opacity={0.1} />
      <div style={{ height: 0.5, backgroundColor: accent, opacity: 0.3, width: '30%', margin: '4% auto 0' }} />
    </div>
  )
}

// ─── Ornate Layout ──────────────────────────────────────────────────────────

function OrnateMockup({ t }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', backgroundColor: t.bodyBg }}>
      {/* Corner accents */}
      <div style={{ position: 'absolute', top: '3%', left: '3%', width: 12, height: 12, borderTop: `2px solid ${t.accent}`, borderLeft: `2px solid ${t.accent}` }} />
      <div style={{ position: 'absolute', top: '3%', right: '3%', width: 12, height: 12, borderTop: `2px solid ${t.accent}`, borderRight: `2px solid ${t.accent}` }} />
      <div style={{ position: 'absolute', bottom: '3%', left: '3%', width: 12, height: 12, borderBottom: `2px solid ${t.accent}`, borderLeft: `2px solid ${t.accent}` }} />
      <div style={{ position: 'absolute', bottom: '3%', right: '3%', width: 12, height: 12, borderBottom: `2px solid ${t.accent}`, borderRight: `2px solid ${t.accent}` }} />

      {/* Title */}
      <div style={{ padding: '8% 6% 3%', textAlign: 'center' }}>
        <div style={{ color: t.headerText, fontSize: '0.48em', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          INVITATION
        </div>
        <div style={{ marginTop: '3%' }}><Divider color={t.accent} width="40%" /></div>
      </div>

      {/* Photo */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2% 0' }}>
        <div style={{ width: '30%', aspectRatio: '3/4', border: `2px solid ${t.accent}`, padding: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%', height: '100%', border: `1px solid ${t.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)' }}>
            <PhotoCircle color={t.accent} />
          </div>
        </div>
      </div>

      {/* Name */}
      <div style={{ textAlign: 'center', padding: '2% 6%' }}>
        <div style={{ color: t.nameText, fontSize: '0.45em', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          FULL NAME
        </div>
      </div>

      {/* Announcement */}
      <div style={{ padding: '1% 10%', textAlign: 'center' }}>
        <PlaceholderLines color={t.bodyText} count={2} widths={['90%', '65%']} opacity={0.2} />
      </div>

      <div style={{ padding: '2% 0' }}><Divider color={t.accent} width="25%" /></div>

      {/* Events */}
      <div style={{ padding: '1% 8%', flex: 1 }}>
        {[1, 2, 3].map(i => <EventBlock key={i} color={t.bodyText} accent={t.accent} style="card" />)}
      </div>

      {/* Footer */}
      <div style={{ backgroundColor: t.footerBg, padding: '3% 6%', textAlign: 'center' }}>
        <div style={{ height: 2, backgroundColor: t.headerText, opacity: 0.3, borderRadius: 1, width: '50%', margin: '0 auto' }} />
      </div>
    </div>
  )
}

// ─── Centered Layout ────────────────────────────────────────────────────────

function CenteredMockup({ t }) {
  return (
    <>
      {/* Header */}
      <div style={{ backgroundColor: t.headerBg, padding: '5% 4%', textAlign: 'center' }}>
        <div style={{ color: t.headerText, fontSize: '0.45em', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
          INVITATION
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

        <div style={{ marginTop: '2%', width: '50%' }}><Divider color={t.accent} /></div>

        <div style={{ marginTop: '3%', width: '85%' }}>
          <PlaceholderLines color={t.bodyText} count={2} widths={['90%', '65%']} opacity={0.2} />
        </div>

        <div style={{ marginTop: '3%', width: '35%' }}><Divider color={t.accent} /></div>

        {/* Events */}
        <div style={{ marginTop: '3%', width: '90%' }}>
          {[1, 2].map(i => <EventBlock key={i} color={t.bodyText} accent={t.accent} style="divider" />)}
        </div>
      </div>

      {/* Footer */}
      <div style={{ backgroundColor: t.footerBg, padding: '3% 4%', textAlign: 'center' }}>
        <div style={{ height: 2, backgroundColor: t.headerText, opacity: 0.3, borderRadius: 1, width: '45%', margin: '0 auto' }} />
      </div>
    </>
  )
}

// ─── Split Layout ───────────────────────────────────────────────────────────

function SplitMockup({ t }) {
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
      </div>

      {/* Right: text */}
      <div style={{ width: '60%', backgroundColor: t.detailsBg, padding: '6% 5%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ color: t.detailsText, fontSize: '0.4em', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          INVITATION
        </div>
        <div style={{ height: 1, backgroundColor: t.accent, width: '40%', marginTop: '3%', marginBottom: '5%' }} />

        <PlaceholderLines color={t.detailsText} count={3} widths={['100%', '90%', '60%']} opacity={0.15} />

        <div style={{ marginTop: '6%' }}>
          <div style={{ height: 2, backgroundColor: t.accent, opacity: 0.5, borderRadius: 1, width: '50%', marginBottom: '4%' }} />
          {[1, 2, 3].map(i => <EventBlock key={i} color={t.detailsText} accent={t.accent} style="timeline" />)}
        </div>

        <div style={{ marginTop: 'auto' }}>
          <div style={{ height: 0.5, backgroundColor: t.accent, opacity: 0.3, marginBottom: '3%' }} />
          <div style={{ height: 2, backgroundColor: t.detailsText, opacity: 0.1, borderRadius: 1, width: '60%' }} />
        </div>
      </div>
    </div>
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

      {/* Header */}
      <div style={{ backgroundColor: t.headerBg, padding: '5% 6%', textAlign: 'center', margin: '5% 5% 0' }}>
        <div style={{ color: t.headerText, fontSize: '0.42em', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
          INVITATION
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

      {/* Announcement */}
      <div style={{ padding: '1% 12%', margin: '0 5%', backgroundColor: t.bodyBg, textAlign: 'center' }}>
        <PlaceholderLines color={t.bodyText} count={2} widths={['85%', '60%']} opacity={0.2} />
      </div>

      <div style={{ margin: '0 5%', padding: '1% 0' }}><Divider color={t.accent} width="25%" /></div>

      {/* Events */}
      <div style={{ backgroundColor: t.detailsBg, padding: '2% 10%', margin: '0 5%', flex: 1 }}>
        {[1, 2].map(i => <EventBlock key={i} color={t.detailsText} accent={t.accent} style="divider" />)}
      </div>

      {/* Footer */}
      <div style={{ backgroundColor: t.footerBg, padding: '2.5% 4%', textAlign: 'center', margin: '0 5% 5%' }}>
        <div style={{ height: 2, backgroundColor: t.headerText, opacity: 0.3, borderRadius: 1, width: '45%', margin: '0 auto' }} />
      </div>
    </div>
  )
}

// ─── Modern Layout ──────────────────────────────────────────────────────────

function ModernMockup({ t }) {
  return (
    <>
      {/* Header with accent bars */}
      <div style={{ display: 'flex', backgroundColor: t.headerBg }}>
        <div style={{ width: 3, backgroundColor: t.accent }} />
        <div style={{ flex: 1, padding: '5% 4%', textAlign: 'center' }}>
          <div style={{ color: t.headerText, fontSize: '0.45em', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
            INVITATION
          </div>
          <div style={{ marginTop: '3%' }}><Divider color={t.accent} width="40%" /></div>
        </div>
        <div style={{ width: 3, backgroundColor: t.accent }} />
      </div>

      {/* Name */}
      <div style={{ backgroundColor: t.bodyBg, padding: '4% 6% 2%' }}>
        <div style={{ color: t.nameText, fontSize: '0.45em', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          FULL NAME
        </div>
        <div style={{ height: 1.5, backgroundColor: t.accent, width: '25%', marginTop: '2%' }} />
      </div>

      {/* Two-column */}
      <div style={{ backgroundColor: t.bodyBg, padding: '2% 6%', display: 'flex', gap: '4%', flex: 1 }}>
        {/* Left: text + events */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3%' }}>
          <PlaceholderLines color={t.bodyText} count={3} widths={['100%', '95%', '60%']} opacity={0.2} />
          <div style={{ marginTop: '4%' }}>
            <div style={{ height: 2, backgroundColor: t.accent, opacity: 0.5, borderRadius: 1, width: '45%', marginBottom: '4%' }} />
            {[1, 2].map(i => <EventBlock key={i} color={t.bodyText} accent={t.accent} style="left-border" />)}
          </div>
        </div>

        {/* Right: photo */}
        <div style={{ width: '38%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '90%', aspectRatio: '3/4', border: `2px solid ${t.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)' }}>
            <PhotoCircle color={t.accent} size={10} />
          </div>
        </div>
      </div>

      {/* Accent strip */}
      <div style={{ height: 3, backgroundColor: t.accent }} />

      {/* Footer */}
      <div style={{ display: 'flex', backgroundColor: t.footerBg }}>
        <div style={{ width: 3, backgroundColor: t.accent }} />
        <div style={{ flex: 1, padding: '3% 4%', textAlign: 'center' }}>
          <div style={{ height: 2, backgroundColor: t.headerText, opacity: 0.3, borderRadius: 1, width: '50%', margin: '0 auto' }} />
        </div>
        <div style={{ width: 3, backgroundColor: t.accent }} />
      </div>
    </>
  )
}

// ─── Main export ────────────────────────────────────────────────────────────

export default function InvitationMockup({ themeKey = 'burgundyGold', className = '' }) {
  const t = invitationThemes[themeKey] || invitationThemes.burgundyGold
  const layout = t.layout || 'ornate'

  return (
    <div
      className={className}
      style={{
        aspectRatio: '7 / 10',
        backgroundColor: layout === 'ornate' || layout === 'split' || layout === 'bordered' ? t.bodyBg : t.detailsBg,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Playfair Display', Georgia, serif",
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {layout === 'ornate' && <OrnateMockup t={t} />}
      {layout === 'centered' && <CenteredMockup t={t} />}
      {layout === 'split' && <SplitMockup t={t} />}
      {layout === 'bordered' && <BorderedMockup t={t} />}
      {layout === 'modern' && <ModernMockup t={t} />}
    </div>
  )
}
