import { bookletThemes } from '../../utils/bookletDefaultData'

function Divider({ color, width = '50%' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width, margin: '0 auto' }}>
      <div style={{ flex: 1, height: 0.5, backgroundColor: color }} />
      <div style={{ width: 4, height: 4, backgroundColor: color, transform: 'rotate(45deg)', margin: '0 3px', flexShrink: 0 }} />
      <div style={{ flex: 1, height: 0.5, backgroundColor: color }} />
    </div>
  )
}

export default function BookletMockup({ themeKey, className = '' }) {
  const t = bookletThemes[themeKey] || bookletThemes[Object.keys(bookletThemes)[0]]

  return (
    <div
      className={className}
      style={{
        aspectRatio: '7 / 10',
        backgroundColor: t.headerBg,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Playfair Display', Georgia, serif",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8%',
      }}
    >
      <div style={{ color: t.headerText, fontSize: '0.42em', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '4%' }}>
        PROGRAMME
      </div>
      <Divider color={t.accent} width="45%" />

      {/* Photo placeholder */}
      <div style={{ width: '35%', aspectRatio: '3/4', border: `2px solid ${t.accent}`, margin: '5% 0', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)' }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', border: `1px solid ${t.accent}`, opacity: 0.5 }} />
      </div>

      <div style={{ color: t.nameText, fontSize: '0.4em', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        FULL NAME
      </div>

      <div style={{ color: t.headerText, fontSize: '0.28em', opacity: 0.6, marginTop: '2%' }}>
        Birth &mdash; Death
      </div>

      <div style={{ marginTop: 'auto', width: '100%', textAlign: 'center' }}>
        <Divider color={t.accent} width="35%" />
        <div style={{ height: 2, backgroundColor: t.headerText, opacity: 0.15, borderRadius: 1, width: '55%', margin: '4% auto 0' }} />
      </div>
    </div>
  )
}
