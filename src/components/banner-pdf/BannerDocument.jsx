import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer'
import '../pdf/styles' // ensures fonts are registered
import { getBannerTheme } from '../../utils/bannerDefaultData'

// 80cm x 200cm ratio = 2:5 aspect
const BANNER_WIDTH = 226.77
const BANNER_HEIGHT = 566.93

// ─── Shared helpers ──────────────────────────────────────────────────────────

function GoldDivider({ color, width = '50%' }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width, alignSelf: 'center', marginTop: 6 }}>
      <View style={{ flex: 1, height: 0.5, backgroundColor: color }} />
      <View style={{ width: 4, height: 4, transform: 'rotate(45deg)', marginHorizontal: 3, backgroundColor: color }} />
      <View style={{ flex: 1, height: 0.5, backgroundColor: color }} />
    </View>
  )
}

function PhotoFrame({ data, theme, width = 140, height = 175, borderStyle = 'double' }) {
  if (borderStyle === 'double') {
    return (
      <View style={{ padding: 3, borderWidth: 1.5, borderStyle: 'solid', borderColor: theme.accent }}>
        <View style={{ padding: 1.5, borderWidth: 0.75, borderStyle: 'solid', borderColor: theme.accent }}>
          {data.photo ? (
            <Image src={data.photo} style={{ width, height, objectFit: 'cover' }} />
          ) : (
            <View style={{ width, height, alignItems: 'center', justifyContent: 'center', borderWidth: 0.75, borderStyle: 'dashed', borderColor: '#999999', backgroundColor: theme.bodyBg }}>
              <Text style={{ fontSize: 7, color: '#999999', fontStyle: 'italic' }}>Photo</Text>
            </View>
          )}
        </View>
      </View>
    )
  }
  if (borderStyle === 'accent-line') {
    return (
      <View style={{ borderWidth: 2, borderColor: theme.accent }}>
        {data.photo ? (
          <Image src={data.photo} style={{ width, height, objectFit: 'cover' }} />
        ) : (
          <View style={{ width, height, alignItems: 'center', justifyContent: 'center', borderWidth: 0.75, borderStyle: 'dashed', borderColor: '#999999', backgroundColor: theme.bodyBg }}>
            <Text style={{ fontSize: 7, color: '#999999', fontStyle: 'italic' }}>Photo</Text>
          </View>
        )}
      </View>
    )
  }
  if (borderStyle === 'circle') {
    return (
      <View style={{ width: width, height: width, borderRadius: width / 2, borderWidth: 2, borderColor: theme.accent, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
        {data.photo ? (
          <Image src={data.photo} style={{ width: width, height: width, objectFit: 'cover' }} />
        ) : (
          <View style={{ width: width, height: width, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.bodyBg }}>
            <Text style={{ fontSize: 7, color: '#999999', fontStyle: 'italic' }}>Photo</Text>
          </View>
        )}
      </View>
    )
  }
  // simple
  return data.photo ? (
    <Image src={data.photo} style={{ width, height, objectFit: 'cover' }} />
  ) : (
    <View style={{ width, height, alignItems: 'center', justifyContent: 'center', borderWidth: 0.75, borderStyle: 'dashed', borderColor: '#999999', backgroundColor: theme.bodyBg }}>
      <Text style={{ fontSize: 7, color: '#999999', fontStyle: 'italic' }}>Photo</Text>
    </View>
  )
}

function AgeBadge({ age, theme }) {
  if (!age) return null
  return (
    <View style={{ marginTop: 6, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.badgeBg }}>
      <Text style={{ fontFamily: 'Playfair', fontWeight: 700, fontSize: 7, letterSpacing: 0.8, color: theme.badgeText }}>
        Aged {age} yrs
      </Text>
    </View>
  )
}

function DateLine({ data, color }) {
  const parts = []
  if (data.dateOfBirth) parts.push(data.dateOfBirth)
  if (data.dateOfDeath) parts.push(data.dateOfDeath)
  if (parts.length === 0) return null
  const text = parts.length === 2 ? `${parts[0]}  —  ${parts[1]}` : parts[0]
  return (
    <Text style={{ fontFamily: 'EBGaramond', fontSize: 7, textAlign: 'center', marginTop: 4, letterSpacing: 0.3, color, opacity: 0.8 }}>
      {text}
    </Text>
  )
}

function ScriptureBlock({ data, theme, align = 'center' }) {
  if (!data.scriptureVerse && !data.scriptureRef) return null
  return (
    <View style={{ marginTop: 10, paddingHorizontal: 14 }}>
      {data.scriptureVerse ? (
        <Text style={{ fontFamily: 'Cormorant', fontStyle: 'italic', fontSize: 8, lineHeight: 1.5, textAlign: align, color: theme.bodyText }}>
          "{data.scriptureVerse}"
        </Text>
      ) : null}
      {data.scriptureRef ? (
        <Text style={{ fontFamily: 'Playfair', fontWeight: 700, fontSize: 6.5, letterSpacing: 0.5, textAlign: align, marginTop: 4, color: theme.accent }}>
          — {data.scriptureRef}
        </Text>
      ) : null}
    </View>
  )
}

function FamilyTextBlock({ data, theme, align = 'center' }) {
  if (!data.familyText) return null
  return (
    <View style={{ paddingHorizontal: 14, marginTop: 8 }}>
      <Text style={{ fontFamily: 'EBGaramond', fontSize: 7, lineHeight: 1.5, textAlign: align, color: theme.bodyText, opacity: 0.9 }}>
        {data.familyText}
      </Text>
    </View>
  )
}

// ─── LAYOUT: Classic ─────────────────────────────────────────────────────────
// Photo top, text flowing down

function ClassicLayout({ data, theme }) {
  return (
    <Page size={[BANNER_WIDTH, BANNER_HEIGHT]} style={{ fontFamily: 'EBGaramond', fontSize: 7 }}>
      {/* Header Band */}
      <View style={{ paddingVertical: 14, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.headerBg }}>
        <Text style={{ fontFamily: 'Playfair', fontWeight: 700, fontSize: 11, letterSpacing: 3, textAlign: 'center', textTransform: 'uppercase', color: theme.headerText }}>
          {data.headerTitle || 'IN LOVING MEMORY OF'}
        </Text>
        <GoldDivider color={theme.divider} />
      </View>

      {/* Photo */}
      <View style={{ alignItems: 'center', paddingVertical: 14, backgroundColor: theme.bodyBg }}>
        <PhotoFrame data={data} theme={theme} width={140} height={175} />
        <AgeBadge age={data.age} theme={theme} />
      </View>

      {/* Name Band */}
      <View style={{ paddingVertical: 10, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.accent }}>
        <Text style={{ fontFamily: 'Playfair', fontWeight: 700, fontSize: 12, letterSpacing: 2, textAlign: 'center', textTransform: 'uppercase', color: theme.headerBg }}>
          {data.fullName || 'Full Name'}
        </Text>
        {data.alias ? <Text style={{ fontFamily: 'Cormorant', fontStyle: 'italic', fontSize: 8, textAlign: 'center', marginTop: 2, color: theme.headerBg, opacity: 0.8 }}>({data.alias})</Text> : null}
      </View>

      {/* Dates */}
      <View style={{ paddingVertical: 6, alignItems: 'center', backgroundColor: theme.bodyBg }}>
        <DateLine data={data} color={theme.bodyText} />
      </View>

      {/* Scripture */}
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: theme.bodyBg }}>
        <ScriptureBlock data={data} theme={theme} />
      </View>

      {/* Divider */}
      <View style={{ paddingVertical: 4, backgroundColor: theme.bodyBg }}>
        <GoldDivider color={theme.divider} width="40%" />
      </View>

      {/* Family Text */}
      <View style={{ paddingBottom: 16, backgroundColor: theme.bodyBg }}>
        <FamilyTextBlock data={data} theme={theme} />
      </View>

      {/* Footer */}
      <View style={{ paddingVertical: 8, backgroundColor: theme.footerBg }}>
        <View style={{ height: 0.5, backgroundColor: theme.accent, width: '60%', alignSelf: 'center' }} />
      </View>
    </Page>
  )
}

// ─── LAYOUT: Elegant ─────────────────────────────────────────────────────────
// Ornamental corners, diamond photo frame

function ElegantLayout({ data, theme }) {
  return (
    <Page size={[BANNER_WIDTH, BANNER_HEIGHT]} style={{ fontFamily: 'EBGaramond', fontSize: 7, backgroundColor: theme.detailsBg }}>
      {/* Outer decorative border */}
      <View style={{
        position: 'absolute', top: 10, left: 10, right: 10, bottom: 10,
        borderWidth: 1.5, borderColor: theme.accent,
      }} />
      <View style={{
        position: 'absolute', top: 14, left: 14, right: 14, bottom: 14,
        borderWidth: 0.5, borderColor: theme.accent, opacity: 0.5,
      }} />
      <View style={{
        position: 'absolute', top: 17, left: 17, right: 17, bottom: 17,
        borderWidth: 0.75, borderColor: theme.accent,
      }} />

      {/* Header inside frame */}
      <View style={{ paddingTop: 30, paddingBottom: 10, paddingHorizontal: 22, alignItems: 'center', backgroundColor: theme.headerBg, marginTop: 20, marginHorizontal: 20 }}>
        <Text style={{ fontFamily: 'Playfair', fontWeight: 700, fontSize: 10, letterSpacing: 2.5, textAlign: 'center', textTransform: 'uppercase', color: theme.headerText }}>
          {data.headerTitle || 'IN LOVING MEMORY OF'}
        </Text>
        <GoldDivider color={theme.divider} width="50%" />
      </View>

      {/* Photo in diamond frame (rotated border) */}
      <View style={{ alignItems: 'center', paddingVertical: 14, backgroundColor: theme.bodyBg, marginHorizontal: 20 }}>
        <View style={{ padding: 4, borderWidth: 1.5, borderColor: theme.accent, transform: 'rotate(0deg)' }}>
          <PhotoFrame data={data} theme={theme} width={120} height={150} borderStyle="simple" />
        </View>
        <AgeBadge age={data.age} theme={theme} />
      </View>

      {/* Name */}
      <View style={{ alignItems: 'center', paddingVertical: 8, backgroundColor: theme.bodyBg, marginHorizontal: 20 }}>
        <GoldDivider color={theme.divider} width="50%" />
        <Text style={{ fontFamily: 'Playfair', fontWeight: 700, fontSize: 12, letterSpacing: 2, textAlign: 'center', textTransform: 'uppercase', color: theme.accent, marginTop: 6 }}>
          {data.fullName || 'Full Name'}
        </Text>
        {data.alias ? <Text style={{ fontFamily: 'Cormorant', fontStyle: 'italic', fontSize: 8, textAlign: 'center', marginTop: 2, color: theme.bodyText, opacity: 0.8 }}>({data.alias})</Text> : null}
        <DateLine data={data} color={theme.bodyText} />
      </View>

      {/* Scripture centered */}
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: theme.bodyBg, marginHorizontal: 20 }}>
        <ScriptureBlock data={data} theme={theme} />
      </View>

      {/* Divider */}
      <View style={{ paddingVertical: 4, backgroundColor: theme.bodyBg, marginHorizontal: 20 }}>
        <GoldDivider color={theme.divider} width="35%" />
      </View>

      {/* Family text in footer */}
      <View style={{ paddingBottom: 10, backgroundColor: theme.bodyBg, marginHorizontal: 20 }}>
        <FamilyTextBlock data={data} theme={theme} />
      </View>

      {/* Footer */}
      <View style={{ paddingVertical: 8, backgroundColor: theme.footerBg, marginHorizontal: 20, marginBottom: 20 }}>
        <View style={{ height: 0.5, backgroundColor: theme.headerText, opacity: 0.4, width: '50%', alignSelf: 'center' }} />
      </View>
    </Page>
  )
}

// ─── LAYOUT: Modern ──────────────────────────────────────────────────────────
// Accent bars on sides, left-aligned name, scripture with left border

function ModernLayout({ data, theme }) {
  return (
    <Page size={[BANNER_WIDTH, BANNER_HEIGHT]} style={{ fontFamily: 'EBGaramond', fontSize: 7 }}>
      {/* Header with accent bars */}
      <View style={{ flexDirection: 'row', backgroundColor: theme.headerBg }}>
        <View style={{ width: 4, backgroundColor: theme.accent }} />
        <View style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 12, alignItems: 'center' }}>
          <Text style={{ fontFamily: 'Playfair', fontWeight: 700, fontSize: 10, letterSpacing: 2, textAlign: 'center', textTransform: 'uppercase', color: theme.headerText }}>
            {data.headerTitle || 'IN LOVING MEMORY OF'}
          </Text>
          <GoldDivider color={theme.divider} width="50%" />
        </View>
        <View style={{ width: 4, backgroundColor: theme.accent }} />
      </View>

      {/* Photo with simple border */}
      <View style={{ alignItems: 'center', paddingVertical: 14, backgroundColor: theme.bodyBg }}>
        <PhotoFrame data={data} theme={theme} width={140} height={175} borderStyle="accent-line" />
        <AgeBadge age={data.age} theme={theme} />
      </View>

      {/* Name left-aligned */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: theme.bodyBg }}>
        <Text style={{ fontFamily: 'Playfair', fontWeight: 700, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', color: theme.accent }}>
          {data.fullName || 'Full Name'}
        </Text>
        {data.alias ? <Text style={{ fontFamily: 'Cormorant', fontStyle: 'italic', fontSize: 8, color: theme.bodyText, opacity: 0.8, marginTop: 2 }}>({data.alias})</Text> : null}
        <DateLine data={data} color={theme.bodyText} />
        <View style={{ height: 1, backgroundColor: theme.accent, marginTop: 8, width: '40%' }} />
      </View>

      {/* Scripture with left border accent */}
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 16, backgroundColor: theme.bodyBg }}>
        {(data.scriptureVerse || data.scriptureRef) ? (
          <View style={{ borderLeftWidth: 2, borderLeftColor: theme.accent, paddingLeft: 10 }}>
            {data.scriptureVerse ? (
              <Text style={{ fontFamily: 'Cormorant', fontStyle: 'italic', fontSize: 8, lineHeight: 1.5, color: theme.bodyText }}>
                "{data.scriptureVerse}"
              </Text>
            ) : null}
            {data.scriptureRef ? (
              <Text style={{ fontFamily: 'Playfair', fontWeight: 700, fontSize: 6.5, letterSpacing: 0.5, marginTop: 4, color: theme.accent }}>
                — {data.scriptureRef}
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>

      {/* Accent strip */}
      <View style={{ height: 3, backgroundColor: theme.accent }} />

      {/* Family text at bottom */}
      <View style={{ paddingVertical: 10, paddingHorizontal: 16, backgroundColor: theme.bodyBg }}>
        <FamilyTextBlock data={data} theme={theme} align="left" />
      </View>

      {/* Footer with accent bars */}
      <View style={{ flexDirection: 'row', backgroundColor: theme.footerBg }}>
        <View style={{ width: 4, backgroundColor: theme.accent }} />
        <View style={{ flex: 1, paddingVertical: 8, alignItems: 'center' }}>
          <View style={{ height: 0.5, backgroundColor: theme.headerText, opacity: 0.4, width: '50%' }} />
        </View>
        <View style={{ width: 4, backgroundColor: theme.accent }} />
      </View>
    </Page>
  )
}

// ─── LAYOUT: Heritage ────────────────────────────────────────────────────────
// Kente-inspired accent strips, warm tones, double border photo

function HeritageLayout({ data, theme }) {
  return (
    <Page size={[BANNER_WIDTH, BANNER_HEIGHT]} style={{ fontFamily: 'EBGaramond', fontSize: 7 }}>
      {/* Kente accent strip top */}
      <View style={{ height: 4, backgroundColor: theme.accent }} />

      {/* Header */}
      <View style={{ paddingVertical: 14, paddingHorizontal: 14, alignItems: 'center', backgroundColor: theme.headerBg }}>
        <Text style={{ fontFamily: 'Playfair', fontWeight: 700, fontSize: 11, letterSpacing: 3, textAlign: 'center', textTransform: 'uppercase', color: theme.headerText }}>
          {data.headerTitle || 'IN LOVING MEMORY OF'}
        </Text>
        <GoldDivider color={theme.divider} width="40%" />
      </View>

      {/* Second accent strip */}
      <View style={{ height: 2, backgroundColor: theme.accent }} />

      {/* Photo with double border */}
      <View style={{ alignItems: 'center', paddingVertical: 14, backgroundColor: theme.bodyBg }}>
        <PhotoFrame data={data} theme={theme} width={140} height={175} borderStyle="double" />
        <AgeBadge age={data.age} theme={theme} />
      </View>

      {/* Name band */}
      <View style={{ paddingVertical: 10, paddingHorizontal: 14, alignItems: 'center', backgroundColor: theme.accent }}>
        <Text style={{ fontFamily: 'Playfair', fontWeight: 700, fontSize: 12, letterSpacing: 2, textAlign: 'center', textTransform: 'uppercase', color: theme.headerBg }}>
          {data.fullName || 'Full Name'}
        </Text>
        {data.alias ? <Text style={{ fontFamily: 'Cormorant', fontStyle: 'italic', fontSize: 8, textAlign: 'center', marginTop: 2, color: theme.headerBg, opacity: 0.85 }}>({data.alias})</Text> : null}
      </View>

      {/* Dates */}
      <View style={{ paddingVertical: 6, alignItems: 'center', backgroundColor: theme.bodyBg }}>
        <DateLine data={data} color={theme.bodyText} />
      </View>

      {/* Scripture centered */}
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: theme.bodyBg }}>
        <ScriptureBlock data={data} theme={theme} />
      </View>

      {/* Divider */}
      <View style={{ paddingVertical: 4, backgroundColor: theme.bodyBg }}>
        <GoldDivider color={theme.divider} width="35%" />
      </View>

      {/* Family text */}
      <View style={{ paddingBottom: 14, backgroundColor: theme.bodyBg }}>
        <FamilyTextBlock data={data} theme={theme} />
      </View>

      {/* Kente accent strip bottom */}
      <View style={{ height: 2, backgroundColor: theme.accent }} />
      <View style={{ paddingVertical: 8, backgroundColor: theme.footerBg }}>
        <View style={{ height: 0.5, backgroundColor: theme.headerText, opacity: 0.4, width: '50%', alignSelf: 'center' }} />
      </View>
      <View style={{ height: 4, backgroundColor: theme.accent }} />
    </Page>
  )
}

// ─── LAYOUT: Centered ────────────────────────────────────────────────────────
// All content centered, circle photo

function CenteredLayout({ data, theme }) {
  return (
    <Page size={[BANNER_WIDTH, BANNER_HEIGHT]} style={{ fontFamily: 'EBGaramond', fontSize: 7 }}>
      {/* Header */}
      <View style={{ paddingVertical: 14, paddingHorizontal: 14, alignItems: 'center', backgroundColor: theme.headerBg }}>
        <Text style={{ fontFamily: 'Playfair', fontWeight: 700, fontSize: 10, letterSpacing: 2.5, textAlign: 'center', textTransform: 'uppercase', color: theme.headerText }}>
          {data.headerTitle || 'IN LOVING MEMORY OF'}
        </Text>
        <GoldDivider color={theme.divider} width="50%" />
      </View>

      {/* Circle photo */}
      <View style={{ alignItems: 'center', paddingVertical: 16, backgroundColor: theme.bodyBg }}>
        <PhotoFrame data={data} theme={theme} width={120} height={120} borderStyle="circle" />
        <AgeBadge age={data.age} theme={theme} />
      </View>

      {/* Name + dates below photo */}
      <View style={{ alignItems: 'center', paddingVertical: 6, backgroundColor: theme.bodyBg }}>
        <Text style={{ fontFamily: 'Playfair', fontWeight: 700, fontSize: 12, letterSpacing: 2, textAlign: 'center', textTransform: 'uppercase', color: theme.accent }}>
          {data.fullName || 'Full Name'}
        </Text>
        {data.alias ? <Text style={{ fontFamily: 'Cormorant', fontStyle: 'italic', fontSize: 8, textAlign: 'center', marginTop: 2, color: theme.bodyText, opacity: 0.8 }}>({data.alias})</Text> : null}
        <DateLine data={data} color={theme.bodyText} />
        <View style={{ marginTop: 6 }}><GoldDivider color={theme.divider} width="40%" /></View>
      </View>

      {/* Scripture in elegant spacing */}
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: theme.bodyBg }}>
        <ScriptureBlock data={data} theme={theme} />
      </View>

      {/* Accent divider */}
      <View style={{ height: 2, backgroundColor: theme.accent }} />

      {/* Family text in footer */}
      <View style={{ paddingVertical: 12, backgroundColor: theme.bodyBg }}>
        <FamilyTextBlock data={data} theme={theme} />
      </View>

      {/* Footer */}
      <View style={{ paddingVertical: 8, backgroundColor: theme.footerBg }}>
        <View style={{ height: 0.5, backgroundColor: theme.headerText, opacity: 0.4, width: '50%', alignSelf: 'center' }} />
      </View>
    </Page>
  )
}

// ─── Main export ─────────────────────────────────────────────────────────────

export default function BannerDocument({ data }) {
  const theme = getBannerTheme(data.bannerTheme)
  const layout = theme.layout || 'classic'

  return (
    <Document>
      {layout === 'elegant' && <ElegantLayout data={data} theme={theme} />}
      {layout === 'heritage' && <HeritageLayout data={data} theme={theme} />}
      {layout === 'centered' && <CenteredLayout data={data} theme={theme} />}
      {layout === 'modern' && <ModernLayout data={data} theme={theme} />}
      {layout === 'classic' && <ClassicLayout data={data} theme={theme} />}
    </Document>
  )
}
