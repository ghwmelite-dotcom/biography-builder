import { forwardRef } from 'react'
import { useBrochureStore } from '../../stores/brochureStore'
import { themes } from '../../utils/themes'

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr + 'T00:00').toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const ShareCardPreview = forwardRef(function ShareCardPreview(props, ref) {
  const store = useBrochureStore()
  const theme = themes[store.theme] || themes.blackGold

  return (
    <div
      ref={ref}
      style={{
        width: 1200,
        height: 630,
        backgroundColor: theme.pageBg,
        display: 'flex',
        alignItems: 'center',
        fontFamily: "'Playfair Display', Georgia, serif",
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative border */}
      <div style={{
        position: 'absolute',
        top: 16,
        left: 16,
        right: 16,
        bottom: 16,
        border: `2px solid ${theme.border}`,
        opacity: 0.5,
      }} />

      {/* Photo section */}
      {store.coverPhoto && (
        <div style={{
          width: 350,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 40,
          flexShrink: 0,
        }}>
          <img
            src={store.coverPhoto}
            alt=""
            style={{
              width: 260,
              height: 340,
              objectFit: 'cover',
              objectPosition: 'top',
              borderRadius: '50%',
              border: `3px solid ${theme.border}`,
            }}
          />
        </div>
      )}

      {/* Text section */}
      <div style={{
        flex: 1,
        padding: '40px 60px 40px 20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}>
        <div style={{
          fontSize: 14,
          letterSpacing: 4,
          textTransform: 'uppercase',
          color: theme.subtleText,
          marginBottom: 8,
        }}>
          Celebration of Life
        </div>

        <div style={{
          fontSize: 36,
          fontWeight: 700,
          color: theme.heading,
          lineHeight: 1.2,
          marginBottom: 12,
        }}>
          {store.title} {store.fullName}
        </div>

        <div style={{
          fontSize: 16,
          color: theme.subtleText,
          marginBottom: 24,
        }}>
          {formatDate(store.dateOfBirth)} — {formatDate(store.dateOfDeath)}
        </div>

        <div style={{
          height: 1,
          width: 120,
          backgroundColor: theme.border,
          marginBottom: 24,
          opacity: 0.5,
        }} />

        <div style={{ fontSize: 14, color: theme.bodyText, lineHeight: 1.8 }}>
          {store.funeralDate && (
            <div>{new Date(store.funeralDate + 'T00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
          )}
          {store.funeralTime && (
            <div>{store.funeralTime}</div>
          )}
          {store.funeralVenue && (
            <div>{store.funeralVenue}</div>
          )}
        </div>
      </div>
    </div>
  )
})

export default ShareCardPreview
