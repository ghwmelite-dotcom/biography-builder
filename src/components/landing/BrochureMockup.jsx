import { themes } from '../../utils/themes'

// SVG corner diamond matching the PDF decoration
function CornerDiamond({ color, style }) {
  return (
    <svg
      viewBox="0 0 10 10"
      style={{ position: 'absolute', width: 10, height: 10, ...style }}
    >
      <path d="M5 0 L10 5 L5 10 L0 5 Z" fill={color} />
    </svg>
  )
}

// CSS cross symbol matching the PDF CrossSymbol
function CrossSymbol({ color, size = 24 }) {
  return (
    <svg viewBox="0 0 24 24" style={{ width: size, height: size }}>
      <rect x="10" y="2" width="4" height="20" fill={color} />
      <rect x="4" y="6" width="16" height="4" fill={color} />
    </svg>
  )
}

// Ornamental divider with center diamond matching the PDF OrnamentalDivider
function OrnamentalDivider({ color, width = '60%' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width, margin: '0 auto' }}>
      <div style={{ flex: 1, height: 0.5, backgroundColor: color, opacity: 0.5 }} />
      <svg viewBox="0 0 10 10" style={{ width: 7, height: 7, margin: '0 6px', flexShrink: 0 }}>
        <path d="M5 0 L10 5 L5 10 L0 5 Z" fill={color} />
      </svg>
      <div style={{ flex: 1, height: 0.5, backgroundColor: color, opacity: 0.5 }} />
    </div>
  )
}

// Triple dot ornament
function TripleDot({ color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
      <span style={{ fontSize: 6, color, lineHeight: 1 }}>&#9670;</span>
      <span style={{ fontSize: 8, color, lineHeight: 1 }}>&#10070;</span>
      <span style={{ fontSize: 6, color, lineHeight: 1 }}>&#9670;</span>
    </div>
  )
}

export default function BrochureMockup({ themeKey = 'blackGold', className = '' }) {
  const t = themes[themeKey] || themes.blackGold

  return (
    <div
      className={className}
      style={{
        aspectRatio: '3 / 4',
        backgroundColor: t.pageBg,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Playfair Display', Georgia, serif",
      }}
    >
      {/* Triple border frame */}
      {/* Outer bold border */}
      <div
        style={{
          position: 'absolute',
          top: '3%',
          left: '3%',
          right: '3%',
          bottom: '3%',
          border: `2px solid ${t.border}`,
          pointerEvents: 'none',
        }}
      />
      {/* Middle thin border */}
      <div
        style={{
          position: 'absolute',
          top: '4.2%',
          left: '4.2%',
          right: '4.2%',
          bottom: '4.2%',
          border: `0.5px solid ${t.border}`,
          opacity: 0.5,
          pointerEvents: 'none',
        }}
      />
      {/* Inner bold border */}
      <div
        style={{
          position: 'absolute',
          top: '5%',
          left: '5%',
          right: '5%',
          bottom: '5%',
          border: `1px solid ${t.border}`,
          pointerEvents: 'none',
        }}
      />

      {/* Corner diamonds */}
      <CornerDiamond color={t.border} style={{ top: '2.4%', left: '2.4%' }} />
      <CornerDiamond color={t.border} style={{ top: '2.4%', right: '2.4%' }} />
      <CornerDiamond color={t.border} style={{ bottom: '2.4%', left: '2.4%' }} />
      <CornerDiamond color={t.border} style={{ bottom: '2.4%', right: '2.4%' }} />

      {/* Content area */}
      <div
        style={{
          position: 'absolute',
          top: '8%',
          left: '8%',
          right: '8%',
          bottom: '8%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Cross symbol at top */}
        <CrossSymbol color={t.heading} size={18} />

        {/* Title */}
        <div
          style={{
            color: t.heading,
            fontSize: '0.55em',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            marginTop: '4%',
            textAlign: 'center',
            fontWeight: 700,
          }}
        >
          Celebration of Life
        </div>

        {/* Subtitle */}
        <div
          style={{
            color: t.subtleText,
            fontSize: '0.4em',
            fontStyle: 'italic',
            marginTop: '2%',
            textAlign: 'center',
            fontFamily: "'EB Garamond', 'Cormorant Garamond', Georgia, serif",
          }}
        >
          In Loving Memory of
        </div>

        {/* Ornamental divider */}
        <div style={{ width: '60%', margin: '4% 0' }}>
          <OrnamentalDivider color={t.border} width="100%" />
        </div>

        {/* Portrait circle placeholder */}
        <div
          style={{
            width: '40%',
            aspectRatio: '9 / 11',
            borderRadius: '50%',
            border: `2px solid ${t.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: t.placeholderBg,
            overflow: 'hidden',
          }}
        >
          <CrossSymbol color={t.subtleText} size={22} />
        </div>

        {/* Full Name */}
        <div
          style={{
            color: t.heading,
            fontSize: '0.65em',
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginTop: '4%',
            textAlign: 'center',
            lineHeight: 1.4,
          }}
        >
          FULL NAME
        </div>

        {/* Triple dot */}
        <div style={{ margin: '3% 0' }}>
          <TripleDot color={t.border} />
        </div>

        {/* Date range */}
        <div
          style={{
            color: t.subtleText,
            fontSize: '0.35em',
            letterSpacing: '0.15em',
            textAlign: 'center',
            fontFamily: "'EB Garamond', 'Cormorant Garamond', Georgia, serif",
          }}
        >
          Sunrise &middot; January 1, 1948
        </div>
        <div
          style={{
            color: t.subtleText,
            fontSize: '0.35em',
            letterSpacing: '0.15em',
            textAlign: 'center',
            marginTop: '1%',
            fontFamily: "'EB Garamond', 'Cormorant Garamond', Georgia, serif",
          }}
        >
          Sunset &middot; December 31, 2025
        </div>

        {/* Bottom ornamental divider */}
        <div style={{ width: '50%', margin: '4% 0 2% 0' }}>
          <OrnamentalDivider color={t.border} width="100%" />
        </div>

        {/* Venue info at bottom */}
        <div
          style={{
            borderTop: `0.5px solid ${t.border}`,
            paddingTop: '3%',
            textAlign: 'center',
            opacity: 0.7,
            width: '80%',
          }}
        >
          <div
            style={{
              color: t.heading,
              fontSize: '0.35em',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
          >
            Funeral Service
          </div>
          <div
            style={{
              color: t.subtleText,
              fontSize: '0.3em',
              marginTop: '2%',
              fontFamily: "'EB Garamond', 'Cormorant Garamond', Georgia, serif",
            }}
          >
            Saturday, 15 March 2025 &middot; 10:00 AM
          </div>
        </div>
      </div>
    </div>
  )
}

// Reusable sub-components for the dialog pages
export { CornerDiamond, CrossSymbol, OrnamentalDivider, TripleDot }
