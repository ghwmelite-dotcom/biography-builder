export default function ReminderMockup({ className = '' }) {
  return (
    <div
      className={className}
      style={{
        aspectRatio: '7 / 10',
        backgroundColor: '#111111',
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
          REMINDERS
        </div>
        <div style={{ height: 1, backgroundColor: '#C9A84C', width: '40%', margin: '3% auto', opacity: 0.5 }} />
      </div>

      {/* Timeline items */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4%' }}>
        {[
          { label: 'Birthday', days: '12d', color: '#F43F5E' },
          { label: 'Death Anniversary', days: '45d', color: '#C9A84C' },
          { label: 'Funeral Anniversary', days: '89d', color: '#F59E0B' },
          { label: 'Memorial Service', days: '120d', color: '#22C55E' },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4%' }}>
            <div style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              border: `1.5px solid ${item.color}`,
              backgroundColor: `${item.color}22`,
              flexShrink: 0,
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ height: 2, backgroundColor: '#E0E0E0', opacity: 0.2, borderRadius: 1, width: '75%' }} />
              <div style={{ height: 1.5, backgroundColor: '#E0E0E0', opacity: 0.1, borderRadius: 1, width: '50%', marginTop: '4%' }} />
            </div>
            <div style={{
              padding: '2% 4%',
              borderRadius: 8,
              backgroundColor: `${item.color}22`,
              color: item.color,
              fontSize: '0.28em',
              fontWeight: 700,
              flexShrink: 0,
            }}>
              {item.days}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom */}
      <div style={{ marginTop: 'auto', textAlign: 'center' }}>
        <div style={{ height: 2, backgroundColor: '#C9A84C', opacity: 0.3, borderRadius: 1, width: '50%', margin: '0 auto' }} />
      </div>
    </div>
  )
}
