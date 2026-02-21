import { Page, View, Text } from '@react-pdf/renderer'
import { PageBorders, OrnamentalDivider, CrossSymbol, PageNumber } from './decorations'
import { createStyles } from './styles'

export default function AcknowledgementsPage({ data, theme, pageNum }) {
  const s = createStyles(theme)
  const paragraphs = (data.acknowledgements || '').split('\n\n').filter(Boolean)

  return (
    <Page size="A4" style={s.page}>
      <PageBorders theme={theme} />
      <View style={s.content}>
        <View style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <CrossSymbol theme={theme} size={18} style={{ marginBottom: 6, marginTop: 14 }} />
          <Text style={s.heading}>Acknowledgements</Text>
          <OrnamentalDivider theme={theme} width={160} />

          <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 10, paddingTop: 10 }}>
            {paragraphs.map((para, i) => (
              <Text key={i} style={s.bodyParagraph}>{para.trim()}</Text>
            ))}

            {data.familySignature && (
              <Text style={[s.ackSignature, { marginTop: 20 }]}>
                — {data.familySignature} —
              </Text>
            )}

            <OrnamentalDivider theme={theme} width={120} style={{ marginTop: 20 }} />

            {/* Benediction */}
            <Text style={[s.verseText, { fontSize: 10, marginTop: 8 }]}>
              "The Lord bless you and keep you; the Lord make His face shine on you and be gracious to you; the Lord turn His face toward you and give you peace."
            </Text>
            <Text style={s.verseRef}>— Numbers 6:24–26</Text>
          </View>
        </View>
      </View>
      <PageNumber theme={theme} num={pageNum} />
    </Page>
  )
}
