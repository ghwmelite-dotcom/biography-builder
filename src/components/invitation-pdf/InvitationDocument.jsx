import { Document, Page, View, Text, Image } from '@react-pdf/renderer'
import '../pdf/styles' // ensures fonts are registered
import { getInvitationTheme } from '../../utils/invitationDefaultData'

const A4_WIDTH = 595.28
const A4_HEIGHT = 841.89

// ─── Shared helpers ──────────────────────────────────────────────────────────

function GoldDivider({ color, width = '50%' }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width, alignSelf: 'center', marginTop: 6 }}>
      <View style={{ flex: 1, height: 0.5, backgroundColor: color }} />
      <View style={{ width: 5, height: 5, transform: 'rotate(45deg)', marginHorizontal: 3, backgroundColor: color }} />
      <View style={{ flex: 1, height: 0.5, backgroundColor: color }} />
    </View>
  )
}

function PhotoFrame({ data, theme, width = 140, height = 175, style = 'diamond' }) {
  const photo = data.photo ? (
    <Image src={data.photo} style={{ width, height, objectFit: 'cover' }} />
  ) : (
    <View style={{ width, height, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: '#999999', backgroundColor: theme.bodyBg }}>
      <Text style={{ fontSize: 9, color: '#999999', fontStyle: 'italic' }}>Photo</Text>
    </View>
  )

  if (style === 'diamond') {
    return (
      <View style={{ padding: 4, borderWidth: 2, borderColor: theme.accent, transform: 'rotate(0deg)' }}>
        <View style={{ padding: 2, borderWidth: 1, borderColor: theme.accent }}>
          {photo}
        </View>
      </View>
    )
  }
  if (style === 'circle') {
    return (
      <View style={{ width: width + 8, height: width + 8, borderRadius: (width + 8) / 2, borderWidth: 2, borderColor: theme.accent, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {data.photo ? (
          <Image src={data.photo} style={{ width: width + 4, height: width + 4, objectFit: 'cover' }} />
        ) : (
          <View style={{ width, height: width, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 9, color: '#999999', fontStyle: 'italic' }}>Photo</Text>
          </View>
        )}
      </View>
    )
  }
  // simple
  return (
    <View style={{ borderWidth: 2, borderColor: theme.accent }}>
      {photo}
    </View>
  )
}

function AgeBadge({ age, theme }) {
  if (!age) return null
  return (
    <View style={{ marginTop: 8, paddingHorizontal: 14, paddingVertical: 4, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.badgeBg }}>
      <Text style={{ fontFamily: 'Playfair', fontWeight: 700, fontSize: 8, letterSpacing: 1, color: theme.badgeText }}>
        Aged {age} yrs
      </Text>
    </View>
  )
}

function EventCard({ event, theme, style = 'card' }) {
  if (style === 'card') {
    return (
      <View style={{ marginBottom: 8, padding: 10, backgroundColor: theme.eventCardBg, borderWidth: 1, borderColor: theme.eventCardBorder, borderRadius: 2 }}>
        {event.title ? <Text style={{ fontFamily: 'Playfair', fontWeight: 700, fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', color: theme.accent, marginBottom: 3 }}>{event.title}</Text> : null}
        {event.date ? <Text style={{ fontFamily: 'EBGaramond', fontSize: 8.5, color: theme.detailsText || theme.bodyText, marginBottom: 1 }}>{event.date}</Text> : null}
        {event.time ? <Text style={{ fontFamily: 'EBGaramond', fontSize: 8.5, color: theme.detailsText || theme.bodyText, marginBottom: 1 }}>{event.time}</Text> : null}
        {event.venue ? <Text style={{ fontFamily: 'EBGaramond', fontSize: 8.5, color: theme.detailsText || theme.bodyText, marginBottom: 1 }}>{event.venue}</Text> : null}
        {event.details ? <Text style={{ fontFamily: 'EBGaramond', fontSize: 8, color: theme.detailsText || theme.bodyText, opacity: 0.8, marginTop: 2 }}>{event.details}</Text> : null}
      </View>
    )
  }
  if (style === 'divider') {
    return (
      <View style={{ marginBottom: 10, alignItems: 'center' }}>
        {event.title ? <Text style={{ fontFamily: 'Playfair', fontWeight: 700, fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', color: theme.accent, marginBottom: 3 }}>{event.title}</Text> : null}
        {event.date ? <Text style={{ fontFamily: 'EBGaramond', fontSize: 8.5, color: theme.detailsText || theme.bodyText, textAlign: 'center' }}>{event.date}</Text> : null}
        {event.time ? <Text style={{ fontFamily: 'EBGaramond', fontSize: 8.5, color: theme.detailsText || theme.bodyText, textAlign: 'center' }}>{event.time}</Text> : null}
        {event.venue ? <Text style={{ fontFamily: 'EBGaramond', fontSize: 8.5, color: theme.detailsText || theme.bodyText, textAlign: 'center' }}>{event.venue}</Text> : null}
        {event.details ? <Text style={{ fontFamily: 'EBGaramond', fontSize: 8, color: theme.detailsText || theme.bodyText, opacity: 0.8, textAlign: 'center', marginTop: 2 }}>{event.details}</Text> : null}
        <View style={{ width: '40%', height: 0.5, backgroundColor: theme.divider, opacity: 0.4, marginTop: 8 }} />
      </View>
    )
  }
  if (style === 'timeline') {
    return (
      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        <View style={{ width: 2, backgroundColor: theme.accent, marginRight: 10 }} />
        <View style={{ flex: 1 }}>
          {event.title ? <Text style={{ fontFamily: 'Playfair', fontWeight: 700, fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: theme.accent, marginBottom: 2 }}>{event.title}</Text> : null}
          {event.date ? <Text style={{ fontFamily: 'EBGaramond', fontSize: 8.5, color: theme.bodyText }}>{event.date}</Text> : null}
          {event.time ? <Text style={{ fontFamily: 'EBGaramond', fontSize: 8.5, color: theme.bodyText }}>{event.time}</Text> : null}
          {event.venue ? <Text style={{ fontFamily: 'EBGaramond', fontSize: 8.5, color: theme.bodyText }}>{event.venue}</Text> : null}
          {event.details ? <Text style={{ fontFamily: 'EBGaramond', fontSize: 8, color: theme.bodyText, opacity: 0.8, marginTop: 2 }}>{event.details}</Text> : null}
        </View>
      </View>
    )
  }
  // left-border (modern)
  return (
    <View style={{ marginBottom: 8, paddingLeft: 10, borderLeftWidth: 3, borderLeftColor: theme.accent }}>
      {event.title ? <Text style={{ fontFamily: 'Playfair', fontWeight: 700, fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: theme.detailsText }}>{event.title}</Text> : null}
      {event.date ? <Text style={{ fontFamily: 'EBGaramond', fontSize: 8.5, color: theme.detailsText, marginTop: 1 }}>{event.date}</Text> : null}
      {event.time ? <Text style={{ fontFamily: 'EBGaramond', fontSize: 8.5, color: theme.detailsText }}>{event.time}</Text> : null}
      {event.venue ? <Text style={{ fontFamily: 'EBGaramond', fontSize: 8.5, color: theme.detailsText }}>{event.venue}</Text> : null}
      {event.details ? <Text style={{ fontFamily: 'EBGaramond', fontSize: 8, color: theme.detailsText, opacity: 0.8, marginTop: 2 }}>{event.details}</Text> : null}
    </View>
  )
}

function RsvpFooter({ data, theme, textColor }) {
  const color = textColor || theme.headerText
  return (
    <View style={{ alignItems: 'center' }}>
      {data.rsvpPhone ? (
        <Text style={{ fontFamily: 'EBGaramond', fontSize: 8.5, color, marginBottom: 3 }}>
          RSVP: {data.rsvpPhone}
        </Text>
      ) : null}
      {data.location ? (
        <Text style={{ fontFamily: 'EBGaramond', fontSize: 8, color, opacity: 0.8 }}>
          {data.location}
        </Text>
      ) : null}
      {data.customMessage ? (
        <Text style={{ fontFamily: 'Cormorant', fontStyle: 'italic', fontSize: 8, color, opacity: 0.7, marginTop: 4, textAlign: 'center' }}>
          {data.customMessage}
        </Text>
      ) : null}
    </View>
  )
}

function OrnamentalCorner({ color, position }) {
  const size = 30
  const styles = {
    position: 'absolute',
    width: size,
    height: size,
  }
  if (position === 'topLeft') Object.assign(styles, { top: 14, left: 14 })
  if (position === 'topRight') Object.assign(styles, { top: 14, right: 14 })
  if (position === 'bottomLeft') Object.assign(styles, { bottom: 14, left: 14 })
  if (position === 'bottomRight') Object.assign(styles, { bottom: 14, right: 14 })

  const isTop = position.includes('top')
  const isLeft = position.includes('Left')

  return (
    <View style={styles}>
      <View style={{
        position: 'absolute',
        [isTop ? 'top' : 'bottom']: 0,
        [isLeft ? 'left' : 'right']: 0,
        width: size,
        height: 2,
        backgroundColor: color,
      }} />
      <View style={{
        position: 'absolute',
        [isTop ? 'top' : 'bottom']: 0,
        [isLeft ? 'left' : 'right']: 0,
        width: 2,
        height: size,
        backgroundColor: color,
      }} />
      <View style={{
        position: 'absolute',
        [isTop ? 'top' : 'bottom']: -2,
        [isLeft ? 'left' : 'right']: -2,
        width: 6,
        height: 6,
        backgroundColor: color,
        transform: 'rotate(45deg)',
      }} />
    </View>
  )
}

// ─── LAYOUT: Ornate ─────────────────────────────────────────────────────────
// Full-page dark background, gold ornamental corners, diamond photo frame

function OrnateLayout({ data, theme }) {
  return (
    <Page size={[A4_WIDTH, A4_HEIGHT]} style={{ fontFamily: 'EBGaramond', fontSize: 9 }}>
      <View style={{ flex: 1, backgroundColor: theme.bodyBg }}>
        {/* Ornamental corners */}
        <OrnamentalCorner color={theme.accent} position="topLeft" />
        <OrnamentalCorner color={theme.accent} position="topRight" />
        <OrnamentalCorner color={theme.accent} position="bottomLeft" />
        <OrnamentalCorner color={theme.accent} position="bottomRight" />

        {/* Title */}
        <View style={{ paddingTop: 50, paddingBottom: 10, alignItems: 'center' }}>
          <Text style={{ fontFamily: 'Playfair', fontWeight: 700, fontSize: 20, letterSpacing: 6, textAlign: 'center', textTransform: 'uppercase', color: theme.headerText }}>
            {data.title || 'FUNERAL INVITATION'}
          </Text>
          <GoldDivider color={theme.divider} width="40%" />
        </View>

        {/* Photo + Name */}
        <View style={{ alignItems: 'center', paddingVertical: 14 }}>
          <PhotoFrame data={data} theme={theme} width={130} height={165} style="diamond" />
          <AgeBadge age={data.age} theme={theme} />
          <Text style={{ fontFamily: 'Playfair', fontWeight: 700, fontSize: 18, letterSpacing: 3, textAlign: 'center', textTransform: 'uppercase', color: theme.nameText, marginTop: 10 }}>
            {data.fullName || 'Full Name'}
          </Text>
          {data.alias ? <Text style={{ fontFamily: 'Cormorant', fontStyle: 'italic', fontSize: 11, textAlign: 'center', color: theme.bodyText, opacity: 0.8, marginTop: 2 }}>({data.alias})</Text> : null}
        </View>

        {/* Family Announcement */}
        <View style={{ paddingHorizontal: 60, paddingVertical: 10 }}>
          <Text style={{ fontFamily: 'EBGaramond', fontSize: 9, lineHeight: 1.6, textAlign: 'center', color: theme.bodyText }}>
            {data.familyAnnouncement || ''}
          </Text>
        </View>

        <GoldDivider color={theme.divider} width="30%" />

        {/* Events */}
        <View style={{ paddingHorizontal: 50, paddingVertical: 12 }}>
          {data.events && data.events.map((event, idx) => (
            <EventCard key={idx} event={event} theme={theme} style="card" />
          ))}
        </View>

        {/* Footer */}
        <View style={{ marginTop: 'auto', paddingVertical: 14, paddingHorizontal: 50, alignItems: 'center', backgroundColor: theme.footerBg }}>
          <RsvpFooter data={data} theme={theme} />
          {data.dressCode ? (
            <View style={{ marginTop: 6, paddingHorizontal: 14, paddingVertical: 4, borderRadius: 3, backgroundColor: theme.badgeBg }}>
              <Text style={{ fontFamily: 'Playfair', fontWeight: 700, fontSize: 7, letterSpacing: 1, textTransform: 'uppercase', color: theme.badgeText }}>
                Dress Code: {data.dressCode}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Page>
  )
}

// ─── LAYOUT: Centered ───────────────────────────────────────────────────────
// Elegant simplicity, circular photo, events with dividers

function CenteredLayout({ data, theme }) {
  return (
    <Page size={[A4_WIDTH, A4_HEIGHT]} style={{ fontFamily: 'EBGaramond', fontSize: 9 }}>
      {/* Header bar */}
      <View style={{ paddingVertical: 16, paddingHorizontal: 40, alignItems: 'center', backgroundColor: theme.headerBg }}>
        <Text style={{ fontFamily: 'Playfair', fontWeight: 700, fontSize: 18, letterSpacing: 5, textAlign: 'center', textTransform: 'uppercase', color: theme.headerText }}>
          {data.title || 'FUNERAL INVITATION'}
        </Text>
        <GoldDivider color={theme.divider} width="45%" />
      </View>

      {/* Body */}
      <View style={{ flex: 1, alignItems: 'center', paddingVertical: 20, paddingHorizontal: 50, backgroundColor: theme.bodyBg }}>
        {/* Circular photo */}
        <PhotoFrame data={data} theme={theme} width={120} height={120} style="circle" />
        <AgeBadge age={data.age} theme={theme} />

        {/* Name */}
        <Text style={{ fontFamily: 'Playfair', fontWeight: 700, fontSize: 18, letterSpacing: 3, textAlign: 'center', textTransform: 'uppercase', color: theme.nameText, marginTop: 12 }}>
          {data.fullName || 'Full Name'}
        </Text>
        {data.alias ? <Text style={{ fontFamily: 'Cormorant', fontStyle: 'italic', fontSize: 11, textAlign: 'center', color: theme.bodyText, opacity: 0.8, marginTop: 2 }}>({data.alias})</Text> : null}

        <View style={{ marginTop: 10 }}><GoldDivider color={theme.divider} width="50%" /></View>

        {/* Family Announcement */}
        <Text style={{ fontFamily: 'EBGaramond', fontSize: 9, lineHeight: 1.6, textAlign: 'center', color: theme.bodyText, marginTop: 12, paddingHorizontal: 20 }}>
          {data.familyAnnouncement || ''}
        </Text>

        <View style={{ marginTop: 12 }}><GoldDivider color={theme.divider} width="35%" /></View>

        {/* Events with dividers */}
        <View style={{ marginTop: 14, width: '100%', paddingHorizontal: 20 }}>
          {data.events && data.events.map((event, idx) => (
            <EventCard key={idx} event={event} theme={theme} style="divider" />
          ))}
        </View>

        {/* RSVP + location */}
        <View style={{ marginTop: 'auto', paddingTop: 10, alignItems: 'center' }}>
          <RsvpFooter data={data} theme={theme} textColor={theme.bodyText} />
        </View>
      </View>

      {/* Footer bar */}
      <View style={{ paddingVertical: 10, paddingHorizontal: 40, alignItems: 'center', backgroundColor: theme.footerBg }}>
        {data.dressCode ? (
          <Text style={{ fontFamily: 'Playfair', fontWeight: 700, fontSize: 7.5, letterSpacing: 1.5, textTransform: 'uppercase', color: theme.headerText }}>
            Dress Code: {data.dressCode}
          </Text>
        ) : null}
      </View>
    </Page>
  )
}

// ─── LAYOUT: Split ──────────────────────────────────────────────────────────
// Photo left half, text right half, timeline events

function SplitLayout({ data, theme }) {
  return (
    <Page size={[A4_WIDTH, A4_HEIGHT]} style={{ fontFamily: 'EBGaramond', fontSize: 9 }}>
      <View style={{ flex: 1, flexDirection: 'row' }}>
        {/* Left: Photo + Name */}
        <View style={{ width: '40%', backgroundColor: theme.bodyBg, alignItems: 'center', justifyContent: 'center', paddingVertical: 40, paddingHorizontal: 16 }}>
          <PhotoFrame data={data} theme={theme} width={150} height={190} style="simple" />
          <AgeBadge age={data.age} theme={theme} />
          <Text style={{ fontFamily: 'Playfair', fontWeight: 700, fontSize: 14, letterSpacing: 2, textAlign: 'center', textTransform: 'uppercase', color: theme.nameText, marginTop: 12 }}>
            {data.fullName || 'Full Name'}
          </Text>
          {data.alias ? <Text style={{ fontFamily: 'Cormorant', fontStyle: 'italic', fontSize: 10, textAlign: 'center', color: theme.bodyText, opacity: 0.8, marginTop: 2 }}>({data.alias})</Text> : null}
        </View>

        {/* Right: Title + Announcement + Events */}
        <View style={{ width: '60%', backgroundColor: theme.detailsBg, paddingVertical: 40, paddingHorizontal: 24 }}>
          {/* Title */}
          <Text style={{ fontFamily: 'Playfair', fontWeight: 700, fontSize: 16, letterSpacing: 4, textTransform: 'uppercase', color: theme.detailsText, marginBottom: 6 }}>
            {data.title || 'FUNERAL INVITATION'}
          </Text>
          <View style={{ width: '50%', height: 1, backgroundColor: theme.accent, marginBottom: 16 }} />

          {/* Announcement */}
          <Text style={{ fontFamily: 'EBGaramond', fontSize: 9, lineHeight: 1.6, textAlign: 'justify', color: theme.detailsText, marginBottom: 16 }}>
            {data.familyAnnouncement || ''}
          </Text>

          {/* Events in timeline */}
          <Text style={{ fontFamily: 'Playfair', fontWeight: 700, fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: theme.accent, marginBottom: 8 }}>
            ARRANGEMENTS
          </Text>
          {data.events && data.events.map((event, idx) => (
            <EventCard key={idx} event={event} theme={theme} style="timeline" />
          ))}

          {/* RSVP */}
          <View style={{ marginTop: 'auto' }}>
            <View style={{ height: 0.5, backgroundColor: theme.accent, opacity: 0.4, marginBottom: 10 }} />
            <RsvpFooter data={data} theme={theme} textColor={theme.detailsText} />
            {data.dressCode ? (
              <View style={{ marginTop: 8, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 3, borderRadius: 2, backgroundColor: theme.badgeBg }}>
                <Text style={{ fontFamily: 'Playfair', fontWeight: 700, fontSize: 7, letterSpacing: 1, textTransform: 'uppercase', color: theme.badgeText }}>
                  {data.dressCode}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </Page>
  )
}

// ─── LAYOUT: Bordered ───────────────────────────────────────────────────────
// Triple ornamental border frame enclosing all content

function BorderedLayout({ data, theme }) {
  return (
    <Page size={[A4_WIDTH, A4_HEIGHT]} style={{ fontFamily: 'EBGaramond', fontSize: 9, backgroundColor: theme.detailsBg }}>
      {/* Triple border */}
      <View style={{ position: 'absolute', top: 12, left: 12, right: 12, bottom: 12, borderWidth: 2.5, borderColor: theme.accent }} />
      <View style={{ position: 'absolute', top: 18, left: 18, right: 18, bottom: 18, borderWidth: 0.5, borderColor: theme.accent, opacity: 0.5 }} />
      <View style={{ position: 'absolute', top: 22, left: 22, right: 22, bottom: 22, borderWidth: 1, borderColor: theme.accent }} />

      {/* Content inside frame */}
      <View style={{ flex: 1, margin: 30, alignItems: 'center' }}>
        {/* Header */}
        <View style={{ paddingTop: 20, paddingBottom: 8, alignItems: 'center', backgroundColor: theme.headerBg, alignSelf: 'stretch', paddingHorizontal: 30 }}>
          <Text style={{ fontFamily: 'Playfair', fontWeight: 700, fontSize: 18, letterSpacing: 5, textAlign: 'center', textTransform: 'uppercase', color: theme.headerText }}>
            {data.title || 'FUNERAL INVITATION'}
          </Text>
          <GoldDivider color={theme.divider} width="40%" />
        </View>

        {/* Body */}
        <View style={{ alignItems: 'center', paddingVertical: 14, backgroundColor: theme.bodyBg, alignSelf: 'stretch', paddingHorizontal: 30 }}>
          <PhotoFrame data={data} theme={theme} width={120} height={150} style="diamond" />
          <AgeBadge age={data.age} theme={theme} />

          <Text style={{ fontFamily: 'Playfair', fontWeight: 700, fontSize: 16, letterSpacing: 3, textAlign: 'center', textTransform: 'uppercase', color: theme.nameText, marginTop: 10 }}>
            {data.fullName || 'Full Name'}
          </Text>
          {data.alias ? <Text style={{ fontFamily: 'Cormorant', fontStyle: 'italic', fontSize: 10, textAlign: 'center', color: theme.bodyText, opacity: 0.8, marginTop: 2 }}>({data.alias})</Text> : null}
        </View>

        {/* Announcement */}
        <View style={{ paddingHorizontal: 40, paddingVertical: 8, backgroundColor: theme.bodyBg, alignSelf: 'stretch' }}>
          <Text style={{ fontFamily: 'EBGaramond', fontSize: 9, lineHeight: 1.6, textAlign: 'center', color: theme.bodyText }}>
            {data.familyAnnouncement || ''}
          </Text>
        </View>

        <View style={{ alignSelf: 'stretch', paddingHorizontal: 30 }}>
          <GoldDivider color={theme.divider} width="30%" />
        </View>

        {/* Events */}
        <View style={{ paddingHorizontal: 40, paddingVertical: 10, flex: 1, alignSelf: 'stretch', backgroundColor: theme.detailsBg }}>
          {data.events && data.events.map((event, idx) => (
            <EventCard key={idx} event={event} theme={theme} style="divider" />
          ))}
        </View>

        {/* Footer */}
        <View style={{ paddingVertical: 10, paddingHorizontal: 30, alignItems: 'center', backgroundColor: theme.footerBg, alignSelf: 'stretch' }}>
          <RsvpFooter data={data} theme={theme} />
          {data.dressCode ? (
            <View style={{ marginTop: 4, paddingHorizontal: 12, paddingVertical: 3, borderRadius: 3, backgroundColor: theme.badgeBg }}>
              <Text style={{ fontFamily: 'Playfair', fontWeight: 700, fontSize: 7, letterSpacing: 1, textTransform: 'uppercase', color: theme.badgeText }}>
                Dress Code: {data.dressCode}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Page>
  )
}

// ─── LAYOUT: Modern ─────────────────────────────────────────────────────────
// Clean geometric lines, accent bars, left-bordered events

function ModernLayout({ data, theme }) {
  return (
    <Page size={[A4_WIDTH, A4_HEIGHT]} style={{ fontFamily: 'EBGaramond', fontSize: 9 }}>
      {/* Header with accent bars */}
      <View style={{ flexDirection: 'row', backgroundColor: theme.headerBg }}>
        <View style={{ width: 5, backgroundColor: theme.accent }} />
        <View style={{ flex: 1, paddingVertical: 16, paddingHorizontal: 30, alignItems: 'center' }}>
          <Text style={{ fontFamily: 'Playfair', fontWeight: 700, fontSize: 18, letterSpacing: 5, textAlign: 'center', textTransform: 'uppercase', color: theme.headerText }}>
            {data.title || 'FUNERAL INVITATION'}
          </Text>
          <GoldDivider color={theme.divider} width="40%" />
        </View>
        <View style={{ width: 5, backgroundColor: theme.accent }} />
      </View>

      {/* Name with accent underline */}
      <View style={{ paddingHorizontal: 36, paddingTop: 20, paddingBottom: 6, backgroundColor: theme.bodyBg }}>
        <Text style={{ fontFamily: 'Playfair', fontWeight: 700, fontSize: 20, letterSpacing: 3, textTransform: 'uppercase', color: theme.nameText }}>
          {data.fullName || 'Full Name'}
        </Text>
        {data.alias ? <Text style={{ fontFamily: 'Cormorant', fontStyle: 'italic', fontSize: 11, color: theme.bodyText, opacity: 0.8, marginTop: 2 }}>({data.alias})</Text> : null}
        <View style={{ height: 2, backgroundColor: theme.accent, width: '30%', marginTop: 6 }} />
      </View>

      {/* Two-column body */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 36, paddingVertical: 14, flex: 1, backgroundColor: theme.bodyBg }}>
        {/* Left: announcement + events */}
        <View style={{ width: '58%', paddingRight: 16 }}>
          <Text style={{ fontFamily: 'EBGaramond', fontSize: 9, lineHeight: 1.6, textAlign: 'justify', color: theme.bodyText, marginBottom: 14 }}>
            {data.familyAnnouncement || ''}
          </Text>

          <Text style={{ fontFamily: 'Playfair', fontWeight: 700, fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: theme.accent, marginBottom: 8 }}>
            ARRANGEMENTS
          </Text>
          {data.events && data.events.map((event, idx) => (
            <EventCard key={idx} event={event} theme={theme} style="left-border" />
          ))}
        </View>

        {/* Right: photo + age */}
        <View style={{ width: '42%', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 4 }}>
          <PhotoFrame data={data} theme={theme} width={150} height={190} style="simple" />
          <AgeBadge age={data.age} theme={theme} />
        </View>
      </View>

      {/* Accent strip */}
      <View style={{ height: 4, backgroundColor: theme.accent }} />

      {/* Footer */}
      <View style={{ flexDirection: 'row', backgroundColor: theme.footerBg }}>
        <View style={{ width: 5, backgroundColor: theme.accent }} />
        <View style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <RsvpFooter data={data} theme={theme} />
          {data.dressCode ? (
            <View style={{ paddingHorizontal: 12, paddingVertical: 4, borderRadius: 3, backgroundColor: theme.badgeBg }}>
              <Text style={{ fontFamily: 'Playfair', fontWeight: 700, fontSize: 7, letterSpacing: 1, textTransform: 'uppercase', color: theme.badgeText }}>
                {data.dressCode}
              </Text>
            </View>
          ) : null}
        </View>
        <View style={{ width: 5, backgroundColor: theme.accent }} />
      </View>
    </Page>
  )
}

// ─── Main export ─────────────────────────────────────────────────────────────

export default function InvitationDocument({ data }) {
  const theme = getInvitationTheme(data.invitationTheme)
  const layout = theme.layout || 'ornate'

  return (
    <Document>
      {layout === 'ornate' && <OrnateLayout data={data} theme={theme} />}
      {layout === 'centered' && <CenteredLayout data={data} theme={theme} />}
      {layout === 'split' && <SplitLayout data={data} theme={theme} />}
      {layout === 'bordered' && <BorderedLayout data={data} theme={theme} />}
      {layout === 'modern' && <ModernLayout data={data} theme={theme} />}
    </Document>
  )
}
