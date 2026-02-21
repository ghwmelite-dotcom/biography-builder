import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer'
import '../pdf/styles' // ensures fonts are registered
import { getPosterTheme } from '../../utils/posterDefaultData'

// A3 dimensions in points: 841.89 x 1190.55
const A3_WIDTH = 841.89
const A3_HEIGHT = 1190.55

const styles = StyleSheet.create({
  page: {
    fontFamily: 'EBGaramond',
    fontSize: 9,
  },

  // --- Header Band ---
  headerBand: {
    paddingVertical: 18,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'Playfair',
    fontWeight: 700,
    fontSize: 24,
    letterSpacing: 6,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '50%',
    alignSelf: 'center',
    marginTop: 8,
  },
  dividerLine: {
    flex: 1,
    height: 0.5,
  },
  dividerDiamond: {
    width: 6,
    height: 6,
    transform: 'rotate(45deg)',
    marginHorizontal: 4,
  },

  // --- Main Body ---
  bodySection: {
    flexDirection: 'row',
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  photoColumn: {
    width: '38%',
    alignItems: 'center',
    paddingRight: 20,
  },
  photoBorderOuter: {
    padding: 4,
    borderWidth: 2,
    borderStyle: 'solid',
  },
  photoBorderInner: {
    padding: 2,
    borderWidth: 1,
    borderStyle: 'solid',
  },
  photoImage: {
    width: 240,
    height: 300,
    objectFit: 'cover',
  },
  photoPlaceholder: {
    width: 240,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#999999',
  },
  photoPlaceholderText: {
    fontSize: 10,
    color: '#999999',
    fontStyle: 'italic',
  },
  ageBadge: {
    marginTop: 10,
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ageBadgeText: {
    fontFamily: 'Playfair',
    fontWeight: 700,
    fontSize: 10,
    letterSpacing: 1,
  },
  announcementColumn: {
    width: '62%',
    justifyContent: 'center',
    paddingLeft: 10,
  },
  announcementText: {
    fontFamily: 'EBGaramond',
    fontSize: 9,
    lineHeight: 1.5,
    textAlign: 'justify',
  },

  // --- Name Band ---
  nameBand: {
    paddingVertical: 14,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullNameText: {
    fontFamily: 'Playfair',
    fontWeight: 700,
    fontSize: 20,
    letterSpacing: 4,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  aliasText: {
    fontFamily: 'Cormorant',
    fontStyle: 'italic',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
  },
  deathDetails: {
    fontFamily: 'EBGaramond',
    fontSize: 9,
    textAlign: 'center',
    marginTop: 6,
    letterSpacing: 0.5,
  },

  // --- Details Section ---
  detailsSection: {
    flexDirection: 'row',
    paddingHorizontal: 40,
    paddingVertical: 16,
    flex: 1,
  },
  detailsLeftColumn: {
    width: '50%',
    paddingRight: 20,
  },
  detailsRightColumn: {
    width: '50%',
    paddingLeft: 20,
  },
  detailsSectionHeader: {
    fontFamily: 'Playfair',
    fontWeight: 700,
    fontSize: 9,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 10,
  },
  detailsSectionHeaderFirst: {
    fontFamily: 'Playfair',
    fontWeight: 700,
    fontSize: 9,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  arrangementItem: {
    marginBottom: 5,
  },
  arrangementLabel: {
    fontFamily: 'Playfair',
    fontWeight: 700,
    fontSize: 8,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  arrangementValue: {
    fontFamily: 'EBGaramond',
    fontSize: 8.5,
    marginTop: 1,
    lineHeight: 1.4,
  },
  detailsDivider: {
    height: 0.5,
    marginVertical: 8,
    opacity: 0.4,
  },
  familyRow: {
    marginBottom: 4,
  },
  familyLabel: {
    fontFamily: 'Playfair',
    fontWeight: 700,
    fontSize: 7.5,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  familyValue: {
    fontFamily: 'EBGaramond',
    fontSize: 8.5,
    marginTop: 1,
    lineHeight: 1.4,
  },
  detailsFreeformBlock: {
    marginBottom: 8,
  },
  detailsFreeformText: {
    fontFamily: 'EBGaramond',
    fontSize: 8.5,
    lineHeight: 1.4,
    marginTop: 2,
  },

  // --- Footer Band ---
  footerBand: {
    paddingVertical: 10,
    paddingHorizontal: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  invitationText: {
    fontFamily: 'EBGaramond',
    fontSize: 9,
    textAlign: 'center',
    letterSpacing: 1,
    flex: 1,
  },
  dressCodeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 3,
    marginLeft: 16,
  },
  dressCodeText: {
    fontFamily: 'Playfair',
    fontWeight: 700,
    fontSize: 7,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
})

function GoldDivider({ color, width = '50%' }) {
  return (
    <View style={[styles.dividerRow, { width }]}>
      <View style={[styles.dividerLine, { backgroundColor: color }]} />
      <View style={[styles.dividerDiamond, { backgroundColor: color }]} />
      <View style={[styles.dividerLine, { backgroundColor: color }]} />
    </View>
  )
}

function FamilyField({ label, value, theme }) {
  if (!value) return null
  return (
    <View style={styles.familyRow}>
      <Text style={[styles.familyLabel, { color: theme.detailsText, opacity: 0.7 }]}>{label}</Text>
      <Text style={[styles.familyValue, { color: theme.detailsText }]}>{value}</Text>
    </View>
  )
}

function DetailsFreeform({ title, text, theme }) {
  if (!text) return null
  return (
    <View style={styles.detailsFreeformBlock}>
      <Text style={[styles.detailsSectionHeader, { color: theme.detailsText }]}>{title}</Text>
      <Text style={[styles.detailsFreeformText, { color: theme.detailsText }]}>{text}</Text>
    </View>
  )
}

export default function PosterDocument({ data }) {
  const theme = getPosterTheme(data.posterTheme)

  const hasImmediateFamily = data.father || data.mother || data.widowWidower ||
    data.children || data.grandchildren || data.siblings || data.inLaw

  const hasExtendedFamily = data.brothersSisters || data.cousins ||
    data.nephewsNieces || data.chiefMourners

  return (
    <Document>
      <Page size={[A3_WIDTH, A3_HEIGHT]} style={styles.page}>

        {/* 1. Header Band */}
        <View style={[styles.headerBand, { backgroundColor: theme.headerBg }]}>
          <Text style={[styles.headerTitle, { color: theme.headerText }]}>
            {data.headerTitle || 'CALLED TO GLORY'}
          </Text>
          <GoldDivider color={theme.divider} />
        </View>

        {/* 2. Main Body — Photo + Announcement */}
        <View style={[styles.bodySection, { backgroundColor: theme.bodyBg }]}>
          {/* Left: Photo */}
          <View style={styles.photoColumn}>
            <View style={[styles.photoBorderOuter, { borderColor: theme.accent }]}>
              <View style={[styles.photoBorderInner, { borderColor: theme.accent }]}>
                {data.photo ? (
                  <Image src={data.photo} style={styles.photoImage} />
                ) : (
                  <View style={[styles.photoPlaceholder, { backgroundColor: theme.bodyBg }]}>
                    <Text style={styles.photoPlaceholderText}>Photo</Text>
                  </View>
                )}
              </View>
            </View>
            {data.age ? (
              <View style={[styles.ageBadge, { backgroundColor: theme.badgeBg }]}>
                <Text style={[styles.ageBadgeText, { color: theme.badgeText }]}>
                  Aged {data.age} yrs
                </Text>
              </View>
            ) : null}
          </View>

          {/* Right: Announcement */}
          <View style={styles.announcementColumn}>
            <Text style={[styles.announcementText, { color: theme.bodyText }]}>
              {data.announcementText || ''}
            </Text>
          </View>
        </View>

        {/* 3. Name Band */}
        <View style={[styles.nameBand, { backgroundColor: theme.accent }]}>
          <Text style={[styles.fullNameText, { color: theme.headerBg }]}>
            {data.fullName || 'Full Name'}
          </Text>
          {data.alias ? (
            <Text style={[styles.aliasText, { color: theme.headerBg, opacity: 0.8 }]}>
              ({data.alias})
            </Text>
          ) : null}
          {(data.dateOfDeath || data.placeOfDeath) ? (
            <Text style={[styles.deathDetails, { color: theme.headerBg, opacity: 0.8 }]}>
              {[
                data.dateOfDeath ? `Died: ${data.dateOfDeath}` : '',
                data.placeOfDeath ? `at ${data.placeOfDeath}` : '',
              ].filter(Boolean).join(' ')}
            </Text>
          ) : null}
        </View>

        {/* 4. Details Section */}
        <View style={[styles.detailsSection, { backgroundColor: theme.detailsBg }]}>
          {/* Left Column: Funeral Arrangements + Immediate Family */}
          <View style={styles.detailsLeftColumn}>
            {/* Funeral Arrangements */}
            <Text style={[styles.detailsSectionHeaderFirst, { color: theme.detailsText }]}>
              FUNERAL ARRANGEMENTS
            </Text>
            {data.funeralArrangements && data.funeralArrangements.map((item, idx) => (
              <View key={idx} style={styles.arrangementItem}>
                {item.label ? (
                  <Text style={[styles.arrangementLabel, { color: theme.detailsText }]}>
                    {item.label}
                  </Text>
                ) : null}
                {item.value ? (
                  <Text style={[styles.arrangementValue, { color: theme.detailsText }]}>
                    {item.value}
                  </Text>
                ) : null}
              </View>
            ))}

            {/* Divider between arrangements and family */}
            {hasImmediateFamily ? (
              <>
                <View style={[styles.detailsDivider, { backgroundColor: theme.accent }]} />
                <Text style={[styles.detailsSectionHeader, { color: theme.detailsText }]}>
                  IMMEDIATE FAMILY
                </Text>
                <FamilyField label="FATHER" value={data.father} theme={theme} />
                <FamilyField label="MOTHER" value={data.mother} theme={theme} />
                <FamilyField
                  label={data.widowWidowerLabel || 'WIDOW/WIDOWER'}
                  value={data.widowWidower}
                  theme={theme}
                />
                <FamilyField label="CHILDREN" value={data.children} theme={theme} />
                <FamilyField label="GRANDCHILDREN" value={data.grandchildren} theme={theme} />
                <FamilyField label="SIBLINGS" value={data.siblings} theme={theme} />
                <FamilyField label="IN-LAW" value={data.inLaw} theme={theme} />
              </>
            ) : null}
          </View>

          {/* Right Column: Extended Family + Chief Mourners */}
          <View style={styles.detailsRightColumn}>
            {hasExtendedFamily ? (
              <>
                <DetailsFreeform
                  title="BROTHERS & SISTERS"
                  text={data.brothersSisters}
                  theme={theme}
                />
                <DetailsFreeform
                  title="COUSINS"
                  text={data.cousins}
                  theme={theme}
                />
                <DetailsFreeform
                  title="NEPHEWS & NIECES"
                  text={data.nephewsNieces}
                  theme={theme}
                />
                <DetailsFreeform
                  title="CHIEF MOURNERS"
                  text={data.chiefMourners}
                  theme={theme}
                />
              </>
            ) : null}
          </View>
        </View>

        {/* 5. Footer Band */}
        <View style={[styles.footerBand, { backgroundColor: theme.footerBg }]}>
          <Text style={[styles.invitationText, { color: theme.headerText }]}>
            {data.invitationText || ''}
          </Text>
          {data.dressCode ? (
            <View style={[styles.dressCodeBadge, { backgroundColor: theme.badgeBg }]}>
              <Text style={[styles.dressCodeText, { color: theme.badgeText }]}>
                {data.dressCode}
              </Text>
            </View>
          ) : null}
        </View>

      </Page>
    </Document>
  )
}
