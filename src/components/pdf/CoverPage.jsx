import { Page, View, Text, Image } from '@react-pdf/renderer'
import { PageBorders, OrnamentalDivider, CrossSymbol, TripleDot } from './decorations'
import { createStyles } from './styles'
import { formatDateLong, formatDateFull, formatTime, getYear } from '../../utils/formatDate'

export default function CoverPage({ data, theme }) {
  const s = createStyles(theme)

  return (
    <Page size="A4" style={s.page}>
      <PageBorders theme={theme} />
      <View style={s.content}>
        <View style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          {/* Top section */}
          <CrossSymbol theme={theme} size={20} style={{ marginBottom: 6 }} />
          <Text style={s.coverTitle}>{data.coverSubtitle || 'CELEBRATION OF LIFE'}</Text>
          <Text style={s.coverSubtitle}>In Loving Memory of</Text>

          <OrnamentalDivider theme={theme} width={160} style={{ marginVertical: 12 }} />

          {/* Portrait */}
          <View style={{
            width: 180, height: 220, borderRadius: 90,
            overflow: 'hidden', marginVertical: 14,
            borderWidth: 2.5, borderColor: theme.border, borderStyle: 'solid',
          }}>
            {data.coverPhoto ? (
              <Image src={data.coverPhoto} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
            ) : (
              <View style={[s.photoPlaceholder, { width: '100%', height: '100%', borderWidth: 0.01, borderRadius: 0.01 }]}>
                <CrossSymbol theme={theme} size={30} />
                <Text style={{ fontFamily: 'Cormorant', fontStyle: 'italic', fontSize: 9, color: theme.subtleText, marginTop: 6 }}>
                  [ Portrait Photo ]
                </Text>
              </View>
            )}
          </View>

          {/* Name */}
          <Text style={s.coverName}>
            {data.title ? `${data.title} ` : ''}{data.fullName || 'Full Name'}
          </Text>

          <TripleDot theme={theme} style={{ marginVertical: 6 }} />

          {/* Dates */}
          <Text style={s.coverDates}>
            Sunrise  ·  {formatDateLong(data.dateOfBirth)}
          </Text>
          <Text style={s.coverDates}>
            Sunset  ·  {formatDateLong(data.dateOfDeath)}
          </Text>

          <OrnamentalDivider theme={theme} width={140} style={{ marginVertical: 12 }} />

          {/* Verse */}
          {data.coverVerse && (
            <Text style={[s.coverVerse, { maxWidth: 380, marginBottom: 14 }]}>
              {data.coverVerse}
            </Text>
          )}

          {/* Venue info */}
          <View style={{ borderTopWidth: 0.5, borderTopColor: theme.border, borderTopStyle: 'solid', paddingTop: 10, alignItems: 'center', opacity: 0.7 }}>
            <Text style={[s.coverTitle, { fontSize: 9, letterSpacing: 4, marginBottom: 4 }]}>FUNERAL SERVICE</Text>
            <Text style={s.coverVenue}>
              {formatDateFull(data.funeralDate)}  ·  {formatTime(data.funeralTime)}
            </Text>
            <Text style={[s.coverVenue, { marginTop: 2 }]}>
              {data.funeralVenue}
            </Text>
          </View>
        </View>
      </View>
    </Page>
  )
}
