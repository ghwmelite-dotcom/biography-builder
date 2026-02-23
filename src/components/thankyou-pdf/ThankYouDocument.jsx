import { Document, Page, View, Text, Image } from '@react-pdf/renderer'
import '../pdf/styles' // ensures fonts are registered
import { getThankYouTheme } from '../../utils/thankYouDefaultData'

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

function formatDate(dateStr) {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch {
    return dateStr
  }
}

function DatesLine({ data, theme, textColor }) {
  const color = textColor || theme.bodyText
  const born = formatDate(data.dateOfBirth)
  const died = formatDate(data.dateOfDeath)
  if (!born && !died) return null
  const parts = []
  if (born) parts.push(`Born: ${born}`)
  if (died) parts.push(`Died: ${died}`)
  return (
    <Text style={{ fontFamily: 'EBGaramond', fontSize: 8.5, color, textAlign: 'center', marginTop: 4 }}>
      {parts.join('  |  ')}
    </Text>
  )
}

function FuneralDateFooter({ data, theme }) {
  const funeralDate = formatDate(data.funeralDate)
  if (!funeralDate) return null
  return (
    <Text style={{ fontFamily: 'EBGaramond', fontSize: 8, color: theme.headerText, opacity: 0.8, marginTop: 4 }}>
      Funeral: {funeralDate}
    </Text>
  )
}

// ─── LAYOUT: Centered ───────────────────────────────────────────────────────
// Header bar with title, centered content with circle photo, message, signature, footer bar

function CenteredLayout({ data, theme }) {
  return (
    <Page size={[A4_WIDTH, A4_HEIGHT]} style={{ fontFamily: 'EBGaramond', fontSize: 9 }}>
      {/* Header bar */}
      <View style={{ paddingVertical: 18, paddingHorizontal: 40, alignItems: 'center', backgroundColor: theme.headerBg }}>
        <Text style={{ fontFamily: 'Playfair', fontWeight: 700, fontSize: 22, letterSpacing: 6, textAlign: 'center', textTransform: 'uppercase', color: theme.headerText }}>
          THANK YOU
        </Text>
        <GoldDivider color={theme.divider} width="45%" />
      </View>

      {/* Body */}
      <View style={{ flex: 1, alignItems: 'center', paddingVertical: 24, paddingHorizontal: 60, backgroundColor: theme.bodyBg }}>
        {/* Circular photo */}
        <PhotoFrame data={data} theme={theme} width={120} height={120} style="circle" />
        <AgeBadge age={data.age} theme={theme} />

        {/* Name */}
        <Text style={{ fontFamily: 'Playfair', fontWeight: 700, fontSize: 20, letterSpacing: 3, textAlign: 'center', textTransform: 'uppercase', color: theme.nameText, marginTop: 14 }}>
          {data.fullName || 'Full Name'}
        </Text>
        {data.alias ? <Text style={{ fontFamily: 'Cormorant', fontStyle: 'italic', fontSize: 11, textAlign: 'center', color: theme.bodyText, opacity: 0.8, marginTop: 2 }}>({data.alias})</Text> : null}

        <DatesLine data={data} theme={theme} />

        <View style={{ marginTop: 12 }}><GoldDivider color={theme.divider} width="50%" /></View>

        {/* Thank You Message */}
        <Text style={{ fontFamily: 'EBGaramond', fontSize: 10, lineHeight: 1.7, textAlign: 'center', color: theme.bodyText, marginTop: 16, paddingHorizontal: 20 }}>
          {data.thankYouMessage || ''}
        </Text>

        <View style={{ marginTop: 16 }}><GoldDivider color={theme.divider} width="30%" /></View>

        {/* Signature */}
        {data.familySignature ? (
          <Text style={{ fontFamily: 'Playfair', fontWeight: 700, fontSize: 12, letterSpacing: 1, textAlign: 'center', color: theme.nameText, marginTop: 16 }}>
            {data.familySignature}
          </Text>
        ) : null}

        {/* Custom Closing */}
        {data.customClosing ? (
          <Text style={{ fontFamily: 'Cormorant', fontStyle: 'italic', fontSize: 10, textAlign: 'center', color: theme.bodyText, opacity: 0.8, marginTop: 8 }}>
            {data.customClosing}
          </Text>
        ) : null}
      </View>

      {/* Footer bar */}
      <View style={{ paddingVertical: 12, paddingHorizontal: 40, alignItems: 'center', backgroundColor: theme.footerBg }}>
        <FuneralDateFooter data={data} theme={theme} />
      </View>
    </Page>
  )
}

// ─── LAYOUT: Bordered ───────────────────────────────────────────────────────
// Triple border frame, diamond photo, centered content

function BorderedLayout({ data, theme }) {
  return (
    <Page size={[A4_WIDTH, A4_HEIGHT]} style={{ fontFamily: 'EBGaramond', fontSize: 9, backgroundColor: theme.detailsBg }}>
      {/* Triple border */}
      <View style={{ position: 'absolute', top: 12, left: 12, right: 12, bottom: 12, borderWidth: 2.5, borderColor: theme.accent }} />
      <View style={{ position: 'absolute', top: 18, left: 18, right: 18, bottom: 18, borderWidth: 0.5, borderColor: theme.accent, opacity: 0.5 }} />
      <View style={{ position: 'absolute', top: 22, left: 22, right: 22, bottom: 22, borderWidth: 1, borderColor: theme.accent }} />

      {/* Ornamental corners */}
      <OrnamentalCorner color={theme.accent} position="topLeft" />
      <OrnamentalCorner color={theme.accent} position="topRight" />
      <OrnamentalCorner color={theme.accent} position="bottomLeft" />
      <OrnamentalCorner color={theme.accent} position="bottomRight" />

      {/* Content inside frame */}
      <View style={{ flex: 1, margin: 30, alignItems: 'center' }}>
        {/* Header */}
        <View style={{ paddingTop: 24, paddingBottom: 10, alignItems: 'center', backgroundColor: theme.headerBg, alignSelf: 'stretch', paddingHorizontal: 30 }}>
          <Text style={{ fontFamily: 'Playfair', fontWeight: 700, fontSize: 22, letterSpacing: 6, textAlign: 'center', textTransform: 'uppercase', color: theme.headerText }}>
            THANK YOU
          </Text>
          <GoldDivider color={theme.divider} width="40%" />
        </View>

        {/* Body */}
        <View style={{ alignItems: 'center', paddingVertical: 16, backgroundColor: theme.bodyBg, alignSelf: 'stretch', paddingHorizontal: 30 }}>
          <PhotoFrame data={data} theme={theme} width={120} height={150} style="diamond" />
          <AgeBadge age={data.age} theme={theme} />

          <Text style={{ fontFamily: 'Playfair', fontWeight: 700, fontSize: 18, letterSpacing: 3, textAlign: 'center', textTransform: 'uppercase', color: theme.nameText, marginTop: 12 }}>
            {data.fullName || 'Full Name'}
          </Text>
          {data.alias ? <Text style={{ fontFamily: 'Cormorant', fontStyle: 'italic', fontSize: 10, textAlign: 'center', color: theme.bodyText, opacity: 0.8, marginTop: 2 }}>({data.alias})</Text> : null}

          <DatesLine data={data} theme={theme} />
        </View>

        {/* Message */}
        <View style={{ paddingHorizontal: 40, paddingVertical: 12, backgroundColor: theme.bodyBg, alignSelf: 'stretch' }}>
          <Text style={{ fontFamily: 'EBGaramond', fontSize: 10, lineHeight: 1.7, textAlign: 'center', color: theme.bodyText }}>
            {data.thankYouMessage || ''}
          </Text>
        </View>

        <View style={{ alignSelf: 'stretch', paddingHorizontal: 30 }}>
          <GoldDivider color={theme.divider} width="30%" />
        </View>

        {/* Signature */}
        <View style={{ paddingVertical: 12, alignItems: 'center', flex: 1, justifyContent: 'center', alignSelf: 'stretch', backgroundColor: theme.detailsBg }}>
          {data.familySignature ? (
            <Text style={{ fontFamily: 'Playfair', fontWeight: 700, fontSize: 12, letterSpacing: 1, textAlign: 'center', color: theme.detailsText }}>
              {data.familySignature}
            </Text>
          ) : null}
          {data.customClosing ? (
            <Text style={{ fontFamily: 'Cormorant', fontStyle: 'italic', fontSize: 10, textAlign: 'center', color: theme.detailsText, opacity: 0.8, marginTop: 6 }}>
              {data.customClosing}
            </Text>
          ) : null}
        </View>

        {/* Footer */}
        <View style={{ paddingVertical: 10, paddingHorizontal: 30, alignItems: 'center', backgroundColor: theme.footerBg, alignSelf: 'stretch' }}>
          <FuneralDateFooter data={data} theme={theme} />
        </View>
      </View>
    </Page>
  )
}

// ─── LAYOUT: Minimal ────────────────────────────────────────────────────────
// Light layout on detailsBg, simple header, minimal borders, clean text

function MinimalLayout({ data, theme }) {
  return (
    <Page size={[A4_WIDTH, A4_HEIGHT]} style={{ fontFamily: 'EBGaramond', fontSize: 9, backgroundColor: theme.detailsBg }}>
      {/* Header */}
      <View style={{ paddingTop: 50, paddingBottom: 10, alignItems: 'center', paddingHorizontal: 60 }}>
        <Text style={{ fontFamily: 'Playfair', fontWeight: 700, fontSize: 24, letterSpacing: 8, textAlign: 'center', textTransform: 'uppercase', color: theme.detailsText }}>
          THANK YOU
        </Text>
        <View style={{ width: '30%', height: 1, backgroundColor: theme.accent, marginTop: 8 }} />
      </View>

      {/* Photo */}
      <View style={{ alignItems: 'center', paddingVertical: 16 }}>
        <PhotoFrame data={data} theme={theme} width={110} height={110} style="circle" />
      </View>

      {/* Name */}
      <View style={{ alignItems: 'center', paddingHorizontal: 60 }}>
        <Text style={{ fontFamily: 'Playfair', fontWeight: 700, fontSize: 18, letterSpacing: 3, textAlign: 'center', textTransform: 'uppercase', color: theme.nameText }}>
          {data.fullName || 'Full Name'}
        </Text>
        {data.alias ? <Text style={{ fontFamily: 'Cormorant', fontStyle: 'italic', fontSize: 10, textAlign: 'center', color: theme.detailsText, opacity: 0.7, marginTop: 2 }}>({data.alias})</Text> : null}
        <AgeBadge age={data.age} theme={theme} />
        <DatesLine data={data} theme={theme} textColor={theme.detailsText} />
      </View>

      {/* Message */}
      <View style={{ paddingHorizontal: 70, paddingVertical: 20, flex: 1 }}>
        <Text style={{ fontFamily: 'EBGaramond', fontSize: 10, lineHeight: 1.7, textAlign: 'center', color: theme.detailsText }}>
          {data.thankYouMessage || ''}
        </Text>

        <View style={{ marginTop: 20, alignItems: 'center' }}>
          <View style={{ width: '20%', height: 0.5, backgroundColor: theme.accent, marginBottom: 14 }} />
          {data.familySignature ? (
            <Text style={{ fontFamily: 'Playfair', fontWeight: 700, fontSize: 11, letterSpacing: 1, textAlign: 'center', color: theme.detailsText }}>
              {data.familySignature}
            </Text>
          ) : null}
          {data.customClosing ? (
            <Text style={{ fontFamily: 'Cormorant', fontStyle: 'italic', fontSize: 9.5, textAlign: 'center', color: theme.detailsText, opacity: 0.7, marginTop: 6 }}>
              {data.customClosing}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Footer */}
      <View style={{ paddingVertical: 14, paddingHorizontal: 60, alignItems: 'center', backgroundColor: theme.footerBg }}>
        <FuneralDateFooter data={data} theme={theme} />
      </View>
    </Page>
  )
}

// ─── LAYOUT: PhotoLeft ──────────────────────────────────────────────────────
// Split layout - photo on left 40%, text content on right 60%

function PhotoLeftLayout({ data, theme }) {
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
          <DatesLine data={data} theme={theme} />
        </View>

        {/* Right: Title + Message + Signature */}
        <View style={{ width: '60%', backgroundColor: theme.detailsBg, paddingVertical: 40, paddingHorizontal: 28 }}>
          {/* Title */}
          <Text style={{ fontFamily: 'Playfair', fontWeight: 700, fontSize: 20, letterSpacing: 5, textTransform: 'uppercase', color: theme.detailsText, marginBottom: 6 }}>
            THANK YOU
          </Text>
          <View style={{ width: '50%', height: 1, backgroundColor: theme.accent, marginBottom: 20 }} />

          {/* Message */}
          <Text style={{ fontFamily: 'EBGaramond', fontSize: 10, lineHeight: 1.7, textAlign: 'justify', color: theme.detailsText, marginBottom: 20 }}>
            {data.thankYouMessage || ''}
          </Text>

          {/* Divider */}
          <View style={{ width: '30%', height: 0.5, backgroundColor: theme.accent, marginBottom: 16 }} />

          {/* Signature */}
          {data.familySignature ? (
            <Text style={{ fontFamily: 'Playfair', fontWeight: 700, fontSize: 11, letterSpacing: 1, color: theme.detailsText }}>
              {data.familySignature}
            </Text>
          ) : null}
          {data.customClosing ? (
            <Text style={{ fontFamily: 'Cormorant', fontStyle: 'italic', fontSize: 9.5, color: theme.detailsText, opacity: 0.8, marginTop: 6 }}>
              {data.customClosing}
            </Text>
          ) : null}

          {/* Footer */}
          <View style={{ marginTop: 'auto' }}>
            <View style={{ height: 0.5, backgroundColor: theme.accent, opacity: 0.4, marginBottom: 10 }} />
            {data.funeralDate ? (
              <Text style={{ fontFamily: 'EBGaramond', fontSize: 8, color: theme.detailsText, opacity: 0.7 }}>
                Funeral: {formatDate(data.funeralDate)}
              </Text>
            ) : null}
          </View>
        </View>
      </View>
    </Page>
  )
}

// ─── LAYOUT: PhotoRight ─────────────────────────────────────────────────────
// Split layout - text content on left 60%, photo on right 40%

function PhotoRightLayout({ data, theme }) {
  return (
    <Page size={[A4_WIDTH, A4_HEIGHT]} style={{ fontFamily: 'EBGaramond', fontSize: 9 }}>
      <View style={{ flex: 1, flexDirection: 'row' }}>
        {/* Left: Title + Message + Signature */}
        <View style={{ width: '60%', backgroundColor: theme.detailsBg, paddingVertical: 40, paddingHorizontal: 28 }}>
          {/* Title */}
          <Text style={{ fontFamily: 'Playfair', fontWeight: 700, fontSize: 20, letterSpacing: 5, textTransform: 'uppercase', color: theme.detailsText, marginBottom: 6 }}>
            THANK YOU
          </Text>
          <View style={{ width: '50%', height: 1, backgroundColor: theme.accent, marginBottom: 20 }} />

          {/* Message */}
          <Text style={{ fontFamily: 'EBGaramond', fontSize: 10, lineHeight: 1.7, textAlign: 'justify', color: theme.detailsText, marginBottom: 20 }}>
            {data.thankYouMessage || ''}
          </Text>

          {/* Divider */}
          <View style={{ width: '30%', height: 0.5, backgroundColor: theme.accent, marginBottom: 16 }} />

          {/* Signature */}
          {data.familySignature ? (
            <Text style={{ fontFamily: 'Playfair', fontWeight: 700, fontSize: 11, letterSpacing: 1, color: theme.detailsText }}>
              {data.familySignature}
            </Text>
          ) : null}
          {data.customClosing ? (
            <Text style={{ fontFamily: 'Cormorant', fontStyle: 'italic', fontSize: 9.5, color: theme.detailsText, opacity: 0.8, marginTop: 6 }}>
              {data.customClosing}
            </Text>
          ) : null}

          {/* Footer */}
          <View style={{ marginTop: 'auto' }}>
            <View style={{ height: 0.5, backgroundColor: theme.accent, opacity: 0.4, marginBottom: 10 }} />
            {data.funeralDate ? (
              <Text style={{ fontFamily: 'EBGaramond', fontSize: 8, color: theme.detailsText, opacity: 0.7 }}>
                Funeral: {formatDate(data.funeralDate)}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Right: Photo + Name */}
        <View style={{ width: '40%', backgroundColor: theme.bodyBg, alignItems: 'center', justifyContent: 'center', paddingVertical: 40, paddingHorizontal: 16 }}>
          <PhotoFrame data={data} theme={theme} width={150} height={190} style="simple" />
          <AgeBadge age={data.age} theme={theme} />
          <Text style={{ fontFamily: 'Playfair', fontWeight: 700, fontSize: 14, letterSpacing: 2, textAlign: 'center', textTransform: 'uppercase', color: theme.nameText, marginTop: 12 }}>
            {data.fullName || 'Full Name'}
          </Text>
          {data.alias ? <Text style={{ fontFamily: 'Cormorant', fontStyle: 'italic', fontSize: 10, textAlign: 'center', color: theme.bodyText, opacity: 0.8, marginTop: 2 }}>({data.alias})</Text> : null}
          <DatesLine data={data} theme={theme} />
        </View>
      </View>
    </Page>
  )
}

// ─── Main export ─────────────────────────────────────────────────────────────

export default function ThankYouDocument({ data }) {
  const theme = getThankYouTheme(data.thankYouTheme)
  const layout = theme.layout || 'centered'

  return (
    <Document>
      {layout === 'centered' && <CenteredLayout data={data} theme={theme} />}
      {layout === 'bordered' && <BorderedLayout data={data} theme={theme} />}
      {layout === 'minimal' && <MinimalLayout data={data} theme={theme} />}
      {layout === 'photoLeft' && <PhotoLeftLayout data={data} theme={theme} />}
      {layout === 'photoRight' && <PhotoRightLayout data={data} theme={theme} />}
    </Document>
  )
}
