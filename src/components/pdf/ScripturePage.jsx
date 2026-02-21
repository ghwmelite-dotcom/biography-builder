import { Page, View, Text } from '@react-pdf/renderer'
import { PageBorders, CrossSymbol, OrnamentalDivider, PageNumber } from './decorations'
import { createStyles } from './styles'
import { getAllScriptures } from '../../utils/templates'

const allScriptures = getAllScriptures()

export default function ScripturePage({ data, theme }) {
  const s = createStyles(theme)

  const scripture = data.scriptureKey && data.scriptureKey !== 'custom'
    ? allScriptures[data.scriptureKey]
    : null

  const title = scripture ? scripture.title : 'SCRIPTURE'
  const subtitle = scripture ? scripture.subtitle : ''
  const text = data.scriptureKey === 'custom'
    ? (data.customScripture || '')
    : (scripture ? scripture.text : '')

  const paragraphs = text.split('\n\n').filter(Boolean)

  return (
    <Page size="A4" style={s.page}>
      <PageBorders theme={theme} />
      <View style={s.content}>
        <View style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 }}>
          <CrossSymbol theme={theme} size={22} style={{ marginBottom: 10 }} />

          <Text style={s.heading}>{title}</Text>
          {subtitle && <Text style={s.subheading}>{subtitle}</Text>}

          <OrnamentalDivider theme={theme} width={140} style={{ marginBottom: 16 }} />

          {paragraphs.map((para, i) => (
            <Text key={i} style={[s.verseText, { marginBottom: 8 }]}>
              {para.trim()}
            </Text>
          ))}

          {data.additionalVerse && (
            <>
              <OrnamentalDivider theme={theme} width={120} style={{ marginVertical: 16 }} />
              <Text style={[s.verseText, { fontSize: 10 }]}>
                {data.additionalVerse}
              </Text>
            </>
          )}
        </View>
      </View>
      <PageNumber theme={theme} num="2" />
    </Page>
  )
}
