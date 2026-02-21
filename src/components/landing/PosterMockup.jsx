import { posterThemes } from '../../utils/posterDefaultData'

export default function PosterMockup({ themeKey = 'royalBlue', className = '' }) {
  const t = posterThemes[themeKey] || posterThemes.royalBlue

  return (
    <div
      className={className}
      style={{
        aspectRatio: '7 / 10',
        backgroundColor: t.detailsBg,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Playfair Display', Georgia, serif",
      }}
    >
      {/* Header Band */}
      <div style={{
        backgroundColor: t.headerBg,
        padding: '6% 4%',
        textAlign: 'center',
      }}>
        <div style={{
          color: t.headerText,
          fontSize: '0.55em',
          fontWeight: 700,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
        }}>
          CALLED TO GLORY
        </div>
        {/* Gold divider */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '50%', margin: '4% auto 0' }}>
          <div style={{ flex: 1, height: 0.5, backgroundColor: t.accent }} />
          <div style={{ width: 5, height: 5, backgroundColor: t.accent, transform: 'rotate(45deg)', margin: '0 4px', flexShrink: 0 }} />
          <div style={{ flex: 1, height: 0.5, backgroundColor: t.accent }} />
        </div>
      </div>

      {/* Main Body - Photo + Text */}
      <div style={{
        backgroundColor: t.bodyBg,
        padding: '4%',
        display: 'flex',
        gap: '4%',
      }}>
        {/* Photo placeholder */}
        <div style={{
          width: '35%',
          aspectRatio: '3/4',
          border: `2px solid ${t.accent}`,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          backgroundColor: 'rgba(255,255,255,0.05)',
        }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', border: `1px solid ${t.accent}`, opacity: 0.5 }} />
        </div>
        {/* Text lines */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4%', justifyContent: 'center' }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{
              height: 3,
              backgroundColor: t.bodyText,
              opacity: 0.3,
              borderRadius: 1,
              width: i === 5 ? '60%' : '100%',
            }} />
          ))}
        </div>
      </div>

      {/* Name Band */}
      <div style={{
        backgroundColor: t.accent,
        padding: '3% 4%',
        textAlign: 'center',
      }}>
        <div style={{
          color: t.badgeText,
          fontSize: '0.5em',
          fontWeight: 700,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
        }}>
          FULL NAME
        </div>
      </div>

      {/* Details Section */}
      <div style={{
        backgroundColor: t.detailsBg,
        padding: '4%',
        display: 'flex',
        gap: '4%',
        flex: 1,
      }}>
        {/* Left column */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3%' }}>
          <div style={{ height: 3, backgroundColor: t.detailsText, opacity: 0.15, borderRadius: 1, width: '70%' }} />
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ height: 2, backgroundColor: t.detailsText, opacity: 0.1, borderRadius: 1, width: i === 3 ? '50%' : '85%' }} />
          ))}
        </div>
        {/* Right column */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3%' }}>
          <div style={{ height: 3, backgroundColor: t.detailsText, opacity: 0.15, borderRadius: 1, width: '65%' }} />
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ height: 2, backgroundColor: t.detailsText, opacity: 0.1, borderRadius: 1, width: i === 3 ? '45%' : '80%' }} />
          ))}
        </div>
      </div>

      {/* Footer Band */}
      <div style={{
        backgroundColor: t.footerBg,
        padding: '3% 4%',
        textAlign: 'center',
      }}>
        <div style={{ height: 2, backgroundColor: t.headerText, opacity: 0.3, borderRadius: 1, width: '60%', margin: '0 auto' }} />
      </div>
    </div>
  )
}
