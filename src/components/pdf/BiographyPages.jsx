import { Page, View, Text, Image } from '@react-pdf/renderer'
import { PageBorders, OrnamentalDivider, CrossSymbol, LineDivider, PageNumber } from './decorations'
import { createStyles } from './styles'

export default function BiographyPages({ data, theme, startPageNum }) {
  const s = createStyles(theme)
  const paragraphs = (data.biography || '').split('\n\n').filter(Boolean)

  // Split paragraphs across pages (~6 paragraphs per page)
  const PARAS_PER_PAGE = 6
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
            <CrossSymbol theme={theme} size={18} style={{ marginBottom: 6, marginTop: 10 }} />
            <Text style={s.heading}>Biography</Text>
            <Text style={s.subheading}>
              The Life & Times of {data.title} {data.fullName}
            </Text>
            <OrnamentalDivider theme={theme} width={160} />
          </>
        ) : (
          <>
            <Text style={[s.subheading, { marginTop: 12, marginBottom: 4 }]}>
              Biography — continued
            </Text>
            <LineDivider theme={theme} width="50%" />
          </>
        )}

        <View style={{ flex: 1, paddingTop: 8 }}>
          {pageParagraphs.map((para, i) => (
            <Text key={i} style={s.bodyParagraph}>{para.trim()}</Text>
          ))}

          {/* Show biography photos on first page */}
          {idx === 0 && data.biographyPhotos && data.biographyPhotos.some(Boolean) && (() => {
            const validPhotos = data.biographyPhotos.map((photo, i) => photo ? { photo, index: i } : null).filter(Boolean)
            const count = validPhotos.length
            const photoWidth = count === 1 ? 220 : count === 2 ? 180 : 140
            const photoHeight = count === 1 ? 180 : count === 2 ? 140 : 110
            return (
              <View style={{
                flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start',
                flexWrap: 'wrap', marginTop: 14, gap: 10,
              }}>
                {validPhotos.map(({ photo, index }) => (
                  <View key={index} style={{ alignItems: 'center', maxWidth: photoWidth + 10 }}>
                    <View style={{
                      width: photoWidth, height: photoHeight,
                      borderWidth: 1.5, borderColor: theme.border, borderRadius: 4,
                      overflow: 'hidden',
                    }}>
                      <Image src={photo} style={{
                        width: '100%', height: '100%', objectFit: 'contain',
                      }} />
                    </View>
                    {data.biographyPhotoCaptions && data.biographyPhotoCaptions[index] && (
                      <Text style={[s.photoCaption, { marginTop: 3 }]}>{data.biographyPhotoCaptions[index]}</Text>
                    )}
                  </View>
                ))}
              </View>
            )
          })()}

          {/* Closing verse on last page */}
          {idx === pages.length - 1 && (
            <>
              <OrnamentalDivider theme={theme} width={120} style={{ marginTop: 12 }} />
              <Text style={[s.verseText, { fontSize: 10, marginTop: 4 }]}>
                "I have fought the good fight, I have finished the race, I have kept the faith."
              </Text>
              <Text style={s.verseRef}>— 2 Timothy 4:7</Text>
            </>
          )}
        </View>
      </View>
      <PageNumber theme={theme} num={String(startPageNum + idx)} />
    </Page>
  ))
}
