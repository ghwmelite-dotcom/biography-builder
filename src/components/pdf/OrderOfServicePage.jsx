import { Page, View, Text } from '@react-pdf/renderer'
import { PageBorders, OrnamentalDivider, CrossSymbol, LineDivider, PageNumber } from './decorations'
import { createStyles } from './styles'

export default function OrderOfServicePages({ data, theme, startPageNum }) {
  const s = createStyles(theme)
  const { orderOfService, funeralVenue, burialLocation } = data

  const churchItems = orderOfService.churchService || []
  const burialItems = orderOfService.privateBurial || []

  // Split church items across pages if needed (max ~18 items per page)
  const MAX_PER_PAGE = 18
  const pages = []

  if (churchItems.length <= MAX_PER_PAGE && burialItems.length <= 8) {
    // Everything fits on two pages
    pages.push({ type: 'church', items: churchItems, isFirst: true })
    pages.push({ type: 'burial', items: burialItems })
  } else {
    // Split church service across pages
    for (let i = 0; i < churchItems.length; i += MAX_PER_PAGE) {
      pages.push({
        type: 'church',
        items: churchItems.slice(i, i + MAX_PER_PAGE),
        isFirst: i === 0,
        isContinued: i > 0,
      })
    }
    pages.push({ type: 'burial', items: burialItems })
  }

  return pages.map((pg, idx) => (
    <Page key={idx} size="A4" style={s.page}>
      <PageBorders theme={theme} />
      <View style={s.content}>
        {pg.isFirst ? (
          <>
            <CrossSymbol theme={theme} size={18} style={{ marginBottom: 6, marginTop: 10 }} />
            <Text style={s.heading}>Order of Service</Text>
            <Text style={[s.subheading, { marginBottom: 4 }]}>{funeralVenue}</Text>
            <OrnamentalDivider theme={theme} width={160} />
          </>
        ) : pg.isContinued ? (
          <>
            <Text style={[s.subheading, { marginTop: 10, marginBottom: 6 }]}>
              Order of Service — continued
            </Text>
            <LineDivider theme={theme} width="60%" />
          </>
        ) : null}

        {pg.type === 'church' && pg.isFirst && (
          <Text style={[s.sectionLabel, { marginTop: 10 }]}>
            Part One — Church Service
          </Text>
        )}

        {pg.type === 'burial' && (
          <>
            <Text style={[s.sectionLabel, { marginTop: 14 }]}>
              Part Two — Private Burial
            </Text>
            {burialLocation && (
              <Text style={[s.subheading, { fontSize: 10, marginBottom: 6, marginTop: 0 }]}>
                {burialLocation}
              </Text>
            )}
          </>
        )}

        {pg.items.map((item, i) => (
          <View key={i} style={{
            flexDirection: 'row', paddingVertical: 5,
            borderBottomWidth: 0.3, borderBottomColor: theme.border,
            borderBottomStyle: 'solid',
          }}>
            {item.time ? (
              <Text style={{
                fontFamily: 'Playfair', fontWeight: 700, fontSize: 9,
                color: theme.heading, width: 70,
              }}>
                {item.time}
              </Text>
            ) : (
              <View style={{ width: 70 }} />
            )}
            <Text style={{
              fontFamily: 'EBGaramond', fontSize: 10.5,
              color: theme.subtleText, flex: 1,
            }}>
              {item.description}
            </Text>
          </View>
        ))}
      </View>
      <PageNumber theme={theme} num={String(startPageNum + idx)} />
    </Page>
  ))
}
