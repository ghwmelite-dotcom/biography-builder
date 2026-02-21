import { Page, View, Text, Image } from '@react-pdf/renderer'
import { PageBorders, OrnamentalDivider, CrossSymbol, PageNumber } from './decorations'
import { createStyles } from './styles'

export default function PhotoGalleryPages({ data, theme, startPageNum }) {
  const s = createStyles(theme)

  // Group photos by pageTitle
  const groups = {}
  const photos = data.galleryPhotos || []
  photos.forEach((photo) => {
    const title = photo.pageTitle || 'Photo Gallery'
    if (!groups[title]) groups[title] = []
    groups[title].push(photo)
  })

  // Create pages with 4 photos each max
  const pages = []
  Object.entries(groups).forEach(([title, groupPhotos]) => {
    for (let i = 0; i < groupPhotos.length; i += 4) {
      pages.push({
        title,
        photos: groupPhotos.slice(i, i + 4),
        isContinued: i > 0,
      })
    }
  })

  if (pages.length === 0) return null

  return pages.map((pg, idx) => (
    <Page key={idx} size="A4" style={s.page}>
      <PageBorders theme={theme} />
      <View style={s.content}>
        <CrossSymbol theme={theme} size={16} style={{ marginBottom: 6, marginTop: 10 }} />
        <Text style={[s.heading, { fontSize: 14 }]}>Photo Gallery</Text>
        <Text style={s.subheading}>{pg.title}</Text>
        <OrnamentalDivider theme={theme} width={140} />

        {/* Photo grid - 2 columns */}
        <View style={{
          flex: 1, flexDirection: 'row', flexWrap: 'wrap',
          justifyContent: 'center', paddingTop: 10,
          paddingHorizontal: 10,
        }}>
          {pg.photos.map((photo, i) => (
            <View key={i} style={{ width: '45%', alignItems: 'center', marginBottom: 8, marginHorizontal: 7 }}>
              <View style={{
                width: '100%', height: 160,
                borderWidth: 1.5, borderColor: theme.border, borderRadius: 4,
                borderStyle: 'solid', overflow: 'hidden',
              }}>
                {photo.src ? (
                  <Image src={photo.src} style={{
                    width: '100%', height: '100%', objectFit: 'cover',
                  }} />
                ) : (
                  <View style={[s.photoPlaceholder, {
                    width: '100%', height: '100%', borderWidth: 0, borderRadius: 0,
                  }]}>
                    <CrossSymbol theme={theme} size={20} />
                    <Text style={{
                      fontFamily: 'Cormorant', fontStyle: 'italic', fontSize: 8,
                      color: theme.subtleText, marginTop: 4,
                    }}>
                      [ Photo ]
                    </Text>
                  </View>
                )}
              </View>
              {photo.caption && (
                <Text style={s.photoCaption}>{photo.caption}</Text>
              )}
            </View>
          ))}
        </View>
      </View>
      <PageNumber theme={theme} num={String(startPageNum + idx)} />
    </Page>
  ))
}
