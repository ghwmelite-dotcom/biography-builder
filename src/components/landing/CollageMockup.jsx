export default function CollageMockup({ className = '' }) {
  return (
    <div
      className={className}
      style={{
        aspectRatio: '7 / 10',
        backgroundColor: '#0A0A0A',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Playfair Display', Georgia, serif",
        display: 'flex',
        flexDirection: 'column',
        padding: '6%',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '5%' }}>
        <div style={{ color: '#C9A84C', fontSize: '0.42em', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          PHOTO COLLAGE
        </div>
        <div style={{ height: 1, backgroundColor: '#C9A84C', width: '40%', margin: '3% auto', opacity: 0.5 }} />
      </div>

      {/* 2x2 grid mockup */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3%', flex: 1, padding: '2%' }}>
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            style={{
              backgroundColor: '#1A1A1A',
              border: '1px solid #C9A84C',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ width: 12, height: 12, borderRadius: '50%', border: '1px solid #C9A84C', opacity: 0.4 }} />
          </div>
        ))}
      </div>

      {/* Name overlay */}
      <div style={{ textAlign: 'center', marginTop: '4%' }}>
        <div style={{ color: '#FFFFFF', fontSize: '0.38em', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          FULL NAME
        </div>
        <div style={{ color: '#FFFFFF', fontSize: '0.24em', opacity: 0.5, marginTop: '2%' }}>
          1945 — 2024
        </div>
      </div>
    </div>
  )
}
