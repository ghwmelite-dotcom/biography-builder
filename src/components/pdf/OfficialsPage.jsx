import { Page, View, Text } from '@react-pdf/renderer'
import { PageBorders, OrnamentalDivider, CrossSymbol, LineDivider, PageNumber } from './decorations'
import { createStyles } from './styles'

export default function OfficialsPage({ data, theme, pageNum }) {
  const s = createStyles(theme)
  const { officials } = data

  return (
    <Page size="A4" style={s.page}>
      <PageBorders theme={theme} />
      <View style={s.content}>
        <View style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CrossSymbol theme={theme} size={18} style={{ marginBottom: 8, marginTop: 20 }} />
          <Text style={s.heading}>Programme Officials</Text>
          <OrnamentalDivider theme={theme} width={160} />

          <View style={{ flex: 1, justifyContent: 'center', width: '100%', paddingHorizontal: 20 }}>
            {/* Ministers */}
            {officials.ministers && officials.ministers.length > 0 && (
              <View style={{ marginBottom: 20 }}>
                <Text style={[s.sectionLabel, { textAlign: 'center' }]}>
                  Officiating Ministers
                </Text>
                <LineDivider theme={theme} width="40%" />
                {officials.ministers.map((m, i) => (
                  <View key={i} style={{ marginBottom: 4 }}>
                    <Text style={s.officialRole}>{m.role || 'Minister'}</Text>
                    <Text style={s.officialName}>{m.name || '—'}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Programme Officials */}
            {officials.programmeOfficials && officials.programmeOfficials.length > 0 && (
              <View style={{ marginBottom: 20 }}>
                <Text style={[s.sectionLabel, { textAlign: 'center' }]}>
                  Programme Officials
                </Text>
                <LineDivider theme={theme} width="40%" />
                {officials.programmeOfficials.map((o, i) => (
                  <View key={i} style={{ marginBottom: 4 }}>
                    <Text style={s.officialRole}>{o.role || 'Official'}</Text>
                    <Text style={s.officialName}>{o.name || '—'}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Flower Bearers */}
            {officials.flowerBearers && (
              <View style={{ marginBottom: 20 }}>
                <Text style={[s.sectionLabel, { textAlign: 'center' }]}>
                  Flower Bearers
                </Text>
                <LineDivider theme={theme} width="40%" />
                <Text style={s.officialName}>{officials.flowerBearers}</Text>
              </View>
            )}

            {/* Pall Bearers */}
            {officials.pallBearers && (
              <View style={{ marginBottom: 20 }}>
                <Text style={[s.sectionLabel, { textAlign: 'center' }]}>
                  Pall Bearers
                </Text>
                <LineDivider theme={theme} width="40%" />
                <Text style={s.officialName}>{officials.pallBearers}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
      <PageNumber theme={theme} num={pageNum} />
    </Page>
  )
}
