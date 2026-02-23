export default function BudgetMockup({ className = '' }) {
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
          BUDGET PLANNER
        </div>
        <div style={{ height: 1, backgroundColor: '#C9A84C', width: '40%', margin: '3% auto', opacity: 0.5 }} />
      </div>

      {/* Summary cards mockup */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3%', marginBottom: '5%' }}>
        {['Estimated', 'Actual', 'Received', 'Balance'].map((label, i) => (
          <div key={i} style={{ border: '1px solid #333', borderRadius: 4, padding: '4% 5%' }}>
            <div style={{ color: '#888', fontSize: '0.24em', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
            <div style={{ height: 3, backgroundColor: i === 3 ? '#22c55e' : '#C9A84C', opacity: 0.6, borderRadius: 2, width: '60%', marginTop: '6%' }} />
          </div>
        ))}
      </div>

      {/* Table mockup */}
      <div style={{ flex: 1 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ display: 'flex', gap: '3%', marginBottom: '3%', paddingBottom: '3%', borderBottom: '0.5px solid #333' }}>
            <div style={{ height: 2, backgroundColor: '#C9A84C', opacity: 0.3, borderRadius: 1, width: '25%' }} />
            <div style={{ height: 2, backgroundColor: '#E0E0E0', opacity: 0.15, borderRadius: 1, flex: 1 }} />
            <div style={{ height: 2, backgroundColor: '#E0E0E0', opacity: 0.15, borderRadius: 1, width: '18%' }} />
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center' }}>
        <div style={{ height: 2, backgroundColor: '#C9A84C', opacity: 0.3, borderRadius: 1, width: '50%' }} />
      </div>
    </div>
  )
}
