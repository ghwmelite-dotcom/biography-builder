import { Document, Page, View, Text, Image } from '@react-pdf/renderer'
import '../pdf/styles'
import { getBookletTheme } from '../../utils/bookletDefaultData'
import { defaultScriptures } from '../../utils/defaultData'
import { hymns } from '../../utils/hymnCatalog'

const A5_WIDTH = 419.53
const A5_HEIGHT = 595.28

function GoldDivider({ color, width = '50%' }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width, alignSelf: 'center', marginTop: 6 }}>
      <View style={{ flex: 1, height: 0.5, backgroundColor: color }} />
      <View style={{ width: 5, height: 5, transform: 'rotate(45deg)', marginHorizontal: 3, backgroundColor: color }} />
      <View style={{ flex: 1, height: 0.5, backgroundColor: color }} />
    </View>
  )
}

// Cover Page
function CoverPage({ data, theme }) {
  return (
    <Page size={[A5_WIDTH, A5_HEIGHT]} style={{ fontFamily: 'EBGaramond' }}>
      <View style={{ flex: 1, backgroundColor: theme.headerBg, alignItems: 'center', justifyContent: 'center', padding: 30 }}>
        <Text style={{ fontFamily: 'Playfair', fontWeight: 700, fontSize: 12, letterSpacing: 3, color: theme.headerText, textTransform: 'uppercase', marginBottom: 8 }}>
          Funeral Programme
        </Text>
        <GoldDivider color={theme.divider} width="50%" />

        {/* Photo */}
        <View style={{ marginTop: 16, padding: 3, borderWidth: 2, borderColor: theme.accent }}>
          {data.photo ? (
            <Image src={data.photo} style={{ width: 110, height: 140, objectFit: 'cover' }} />
          ) : (
            <View style={{ width: 110, height: 140, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: '#999' }}>
              <Text style={{ fontSize: 8, color: '#999', fontStyle: 'italic' }}>Photo</Text>
            </View>
          )}
        </View>

        {data.age ? (
          <View style={{ marginTop: 6, paddingHorizontal: 12, paddingVertical: 3, borderRadius: 12, backgroundColor: theme.badgeBg }}>
            <Text style={{ fontFamily: 'Playfair', fontWeight: 700, fontSize: 7, letterSpacing: 1, color: theme.badgeText }}>Aged {data.age} yrs</Text>
          </View>
        ) : null}

        <Text style={{ fontFamily: 'Playfair', fontWeight: 700, fontSize: 16, letterSpacing: 2, color: theme.nameText, textTransform: 'uppercase', marginTop: 10, textAlign: 'center' }}>
          {data.fullName || 'Full Name'}
        </Text>
        {data.alias ? <Text style={{ fontFamily: 'Cormorant', fontStyle: 'italic', fontSize: 10, color: theme.headerText, opacity: 0.8, marginTop: 2 }}>({data.alias})</Text> : null}

        {(data.dateOfBirth || data.dateOfDeath) && (
          <Text style={{ fontSize: 8, color: theme.headerText, opacity: 0.7, marginTop: 6 }}>
            {data.dateOfBirth || '\u2014'} \u2014 {data.dateOfDeath || '\u2014'}
          </Text>
        )}

        <View style={{ marginTop: 'auto', alignItems: 'center' }}>
          <GoldDivider color={theme.divider} width="40%" />
          {data.venue ? <Text style={{ fontSize: 8, color: theme.headerText, marginTop: 6 }}>{data.venue}</Text> : null}
          {data.venueAddress ? <Text style={{ fontSize: 7, color: theme.headerText, opacity: 0.7, marginTop: 2 }}>{data.venueAddress}</Text> : null}
          {data.funeralDate ? <Text style={{ fontSize: 8, color: theme.headerText, marginTop: 4 }}>{data.funeralDate}{data.funeralTime ? ` at ${data.funeralTime}` : ''}</Text> : null}
        </View>
      </View>
    </Page>
  )
}

// Order of Service Page
function ServicePage({ data, theme }) {
  return (
    <Page size={[A5_WIDTH, A5_HEIGHT]} style={{ fontFamily: 'EBGaramond' }}>
      <View style={{ flex: 1, backgroundColor: theme.bodyBg, padding: 30 }}>
        <Text style={{ fontFamily: 'Playfair', fontWeight: 700, fontSize: 14, letterSpacing: 3, color: theme.nameText, textTransform: 'uppercase', textAlign: 'center', marginBottom: 4 }}>
          Order of Service
        </Text>
        <GoldDivider color={theme.divider} width="40%" />

        <View style={{ marginTop: 16 }}>
          {(data.orderOfService || []).map((item, idx) => (
            <View key={idx} style={{ flexDirection: 'row', marginBottom: 8, paddingBottom: 6, borderBottomWidth: 0.5, borderBottomColor: theme.divider, opacity: 0.3 }}>
              {item.time ? (
                <Text style={{ width: 60, fontSize: 8, color: theme.accent, fontFamily: 'Playfair', fontWeight: 700 }}>{item.time}</Text>
              ) : (
                <Text style={{ width: 20, fontSize: 8, color: theme.accent }}>{'\u2022'}</Text>
              )}
              <Text style={{ flex: 1, fontSize: 9, color: theme.bodyText }}>{item.item}</Text>
            </View>
          ))}
        </View>
      </View>
    </Page>
  )
}

// Hymns & Scripture Page
function HymnsScripturePage({ data, theme }) {
  const selectedHymnData = (data.selectedHymns || []).map(id => hymns.find(h => h.id === id)).filter(Boolean)
  const scripture = data.customScripture || (data.scriptureKey && defaultScriptures[data.scriptureKey])

  return (
    <Page size={[A5_WIDTH, A5_HEIGHT]} style={{ fontFamily: 'EBGaramond' }}>
      <View style={{ flex: 1, backgroundColor: theme.bodyBg, padding: 30 }}>
        {/* Hymns */}
        {selectedHymnData.length > 0 && (
          <>
            <Text style={{ fontFamily: 'Playfair', fontWeight: 700, fontSize: 12, letterSpacing: 2, color: theme.nameText, textTransform: 'uppercase', textAlign: 'center', marginBottom: 4 }}>
              Hymns
            </Text>
            <GoldDivider color={theme.divider} width="30%" />
            <View style={{ marginTop: 12, marginBottom: 20 }}>
              {selectedHymnData.map((h, idx) => (
                <View key={idx} style={{ marginBottom: 8, paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: theme.accent }}>
                  <Text style={{ fontFamily: 'Playfair', fontWeight: 700, fontSize: 9, color: theme.nameText }}>{h.title}</Text>
                  <Text style={{ fontSize: 8, color: theme.bodyText, opacity: 0.7, fontStyle: 'italic', marginTop: 1 }}>{h.firstLine}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Scripture */}
        {scripture && (
          <>
            <Text style={{ fontFamily: 'Playfair', fontWeight: 700, fontSize: 12, letterSpacing: 2, color: theme.nameText, textTransform: 'uppercase', textAlign: 'center', marginBottom: 4 }}>
              Scripture Reading
            </Text>
            <GoldDivider color={theme.divider} width="30%" />
            <View style={{ marginTop: 12, paddingHorizontal: 10 }}>
              {typeof scripture === 'string' ? (
                <Text style={{ fontSize: 8.5, lineHeight: 1.6, color: theme.bodyText, textAlign: 'center' }}>{scripture}</Text>
              ) : (
                <>
                  <Text style={{ fontFamily: 'Playfair', fontWeight: 700, fontSize: 10, color: theme.accent, textAlign: 'center', marginBottom: 2 }}>{scripture.title}</Text>
                  <Text style={{ fontFamily: 'Cormorant', fontStyle: 'italic', fontSize: 8, color: theme.bodyText, textAlign: 'center', marginBottom: 6 }}>{scripture.subtitle}</Text>
                  <Text style={{ fontSize: 8.5, lineHeight: 1.6, color: theme.bodyText, textAlign: 'justify' }}>{scripture.text}</Text>
                </>
              )}
            </View>
          </>
        )}
      </View>
    </Page>
  )
}

// Back Cover Page
function BackCoverPage({ data, theme }) {
  return (
    <Page size={[A5_WIDTH, A5_HEIGHT]} style={{ fontFamily: 'EBGaramond' }}>
      <View style={{ flex: 1, backgroundColor: theme.headerBg, alignItems: 'center', justifyContent: 'center', padding: 30 }}>
        <GoldDivider color={theme.divider} width="40%" />

        {data.officiant && (
          <View style={{ marginTop: 20, alignItems: 'center' }}>
            <Text style={{ fontSize: 7, letterSpacing: 1.5, color: theme.headerText, opacity: 0.6, textTransform: 'uppercase' }}>Officiant</Text>
            <Text style={{ fontFamily: 'Playfair', fontWeight: 700, fontSize: 11, color: theme.nameText, marginTop: 4 }}>{data.officiant}</Text>
          </View>
        )}

        {data.churchName && (
          <Text style={{ fontSize: 9, color: theme.headerText, opacity: 0.8, marginTop: 6 }}>{data.churchName}</Text>
        )}

        {data.customBackText && (
          <View style={{ marginTop: 20, paddingHorizontal: 20 }}>
            <Text style={{ fontFamily: 'Cormorant', fontStyle: 'italic', fontSize: 9, color: theme.headerText, opacity: 0.7, textAlign: 'center', lineHeight: 1.5 }}>
              {data.customBackText}
            </Text>
          </View>
        )}

        <View style={{ marginTop: 'auto' }}>
          <GoldDivider color={theme.divider} width="30%" />
        </View>
      </View>
    </Page>
  )
}

export default function BookletDocument({ data }) {
  const theme = getBookletTheme(data.bookletTheme)

  return (
    <Document>
      <CoverPage data={data} theme={theme} />
      <ServicePage data={data} theme={theme} />
      <HymnsScripturePage data={data} theme={theme} />
      <BackCoverPage data={data} theme={theme} />
    </Document>
  )
}
