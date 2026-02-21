import { Page, View, Text, Image } from '@react-pdf/renderer'
import { PageBorders, OrnamentalDivider, CrossSymbol, LineDivider, PageNumber } from './decorations'
import { createStyles } from './styles'

export default function TributePages({ tribute, theme, startPageNum }) {
  const s = createStyles(theme)
  const paragraphs = (tribute.body || '').split('\n\n').filter(Boolean)

  // Split long tributes across pages
  const PARAS_PER_PAGE = 7
  const pages = []
  for (let i = 0; i < paragraphs.length; i += PARAS_PER_PAGE) {
    pages.push(paragraphs.slice(i, i + PARAS_PER_PAGE))
  }
  if (pages.length === 0) pages.push([])

  return pages.map((pageParagraphs, idx) => (
    <Page key={idx} size="A4" style={s.page}>
      <PageBorders theme={theme} />
      <View style={s.content}>
        {idx === 0 ? (
          <>
            <CrossSymbol theme={theme} size={16} style={{ marginBottom: 6, marginTop: 14 }} />
            <Text style={s.heading}>{tribute.title || 'Tribute'}</Text>
            {tribute.subtitle && (
              <Text style={s.subheading}>{tribute.subtitle}</Text>
            )}
            <OrnamentalDivider theme={theme} width={140} />

            {/* Opening verse */}
            {tribute.openingVerse && (
              <Text style={[s.verseText, { fontSize: 10, marginBottom: 10, maxWidth: 360, alignSelf: 'center' }]}>
                {tribute.openingVerse}
              </Text>
            )}
          </>
        ) : (
          <>
            <Text style={[s.subheading, { marginTop: 12, marginBottom: 4 }]}>
              {tribute.title} — continued
            </Text>
            <LineDivider theme={theme} width="50%" />
          </>
        )}

        <View style={{ flex: 1, paddingTop: idx === 0 ? 4 : 8 }}>
          {pageParagraphs.map((para, i) => (
            <Text key={i} style={s.bodyParagraph}>{para.trim()}</Text>
          ))}
        </View>

        {/* Closing on last page */}
        {idx === pages.length - 1 && (
          <>
            <OrnamentalDivider theme={theme} width={100} style={{ marginTop: 8 }} />
            {tribute.closingLine && (
              <Text style={{
                fontFamily: 'Playfair', fontWeight: 700, fontSize: 12,
                color: theme.heading, textAlign: 'center',
                letterSpacing: 2, textTransform: 'uppercase', marginTop: 4,
              }}>
                {tribute.closingLine}
              </Text>
            )}

            {/* Tribute photos */}
            {tribute.photos && tribute.photos.some(Boolean) && (
              <View style={{
                flexDirection: 'row', justifyContent: 'center',
                marginTop: 12,
              }}>
                {tribute.photos.map((photo, i) =>
                  photo ? (
                    <View key={i} style={{ alignItems: 'center', marginHorizontal: 5 }}>
                      <Image src={photo} style={{
                        width: 120, height: 90, objectFit: 'cover',
                        objectPosition: 'center top',
                        borderWidth: 1, borderColor: theme.border, borderRadius: 3,
                      }} />
                      {tribute.photoCaptions && tribute.photoCaptions[i] && (
                        <Text style={s.photoCaption}>{tribute.photoCaptions[i]}</Text>
                      )}
                    </View>
                  ) : null
                )}
              </View>
            )}
          </>
        )}
      </View>
      <PageNumber theme={theme} num={String(startPageNum + idx)} />
    </Page>
  ))
}
