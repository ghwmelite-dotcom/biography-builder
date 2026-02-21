import { StyleSheet, Font } from '@react-pdf/renderer'

// Register fonts
Font.register({
  family: 'Playfair',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/playfair-display@latest/latin-400-normal.ttf', fontWeight: 400 },
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/playfair-display@latest/latin-700-normal.ttf', fontWeight: 700 },
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/playfair-display@latest/latin-400-italic.ttf', fontWeight: 400, fontStyle: 'italic' },
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/playfair-display@latest/latin-700-italic.ttf', fontWeight: 700, fontStyle: 'italic' },
  ],
})

Font.register({
  family: 'EBGaramond',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/eb-garamond@latest/latin-400-normal.ttf', fontWeight: 400 },
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/eb-garamond@latest/latin-700-normal.ttf', fontWeight: 700 },
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/eb-garamond@latest/latin-400-italic.ttf', fontWeight: 400, fontStyle: 'italic' },
  ],
})

Font.register({
  family: 'Cormorant',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/cormorant-garamond@latest/latin-400-normal.ttf', fontWeight: 400 },
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/cormorant-garamond@latest/latin-600-normal.ttf', fontWeight: 600 },
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/cormorant-garamond@latest/latin-400-italic.ttf', fontWeight: 400, fontStyle: 'italic' },
  ],
})

// Disable hyphenation
Font.registerHyphenationCallback(word => [word])

export function createStyles(theme) {
  return StyleSheet.create({
    page: {
      backgroundColor: theme.pageBg,
      fontFamily: 'EBGaramond',
      fontSize: 11,
      color: theme.bodyText,
      position: 'relative',
    },
    // Triple border container
    outerBorder: {
      position: 'absolute',
      top: 18,
      left: 18,
      right: 18,
      bottom: 18,
      borderWidth: 2,
      borderColor: theme.border,
      borderStyle: 'solid',
    },
    middleBorder: {
      position: 'absolute',
      top: 24,
      left: 24,
      right: 24,
      bottom: 24,
      borderWidth: 0.5,
      borderColor: theme.border,
      borderStyle: 'solid',
      opacity: 0.5,
    },
    innerBorder: {
      position: 'absolute',
      top: 28,
      left: 28,
      right: 28,
      bottom: 28,
      borderWidth: 1,
      borderColor: theme.border,
      borderStyle: 'solid',
    },
    // Content area (inside borders)
    content: {
      position: 'absolute',
      top: 40,
      left: 40,
      right: 40,
      bottom: 40,
      display: 'flex',
      flexDirection: 'column',
    },
    // Headings
    heading: {
      fontFamily: 'Playfair',
      fontWeight: 700,
      fontSize: 18,
      color: theme.heading,
      textAlign: 'center',
      letterSpacing: 4,
      textTransform: 'uppercase',
      marginBottom: 4,
    },
    subheading: {
      fontFamily: 'Cormorant',
      fontSize: 14,
      color: theme.subtleText,
      textAlign: 'center',
      fontStyle: 'italic',
      marginBottom: 12,
    },
    // Body text
    bodyText: {
      fontFamily: 'EBGaramond',
      fontSize: 11,
      color: theme.bodyText,
      lineHeight: 1.7,
      textAlign: 'justify',
    },
    bodyParagraph: {
      fontFamily: 'EBGaramond',
      fontSize: 11,
      color: theme.bodyText,
      lineHeight: 1.7,
      textAlign: 'justify',
      marginBottom: 8,
    },
    // Cover text styles
    coverTitle: {
      fontFamily: 'Playfair',
      fontWeight: 700,
      fontSize: 12,
      color: theme.heading,
      textAlign: 'center',
      letterSpacing: 6,
      textTransform: 'uppercase',
    },
    coverSubtitle: {
      fontFamily: 'Cormorant',
      fontStyle: 'italic',
      fontSize: 16,
      color: theme.subtleText,
      textAlign: 'center',
      marginTop: 2,
    },
    coverName: {
      fontFamily: 'Playfair',
      fontWeight: 700,
      fontSize: 24,
      color: theme.heading,
      textAlign: 'center',
      letterSpacing: 3,
      textTransform: 'uppercase',
      lineHeight: 1.4,
    },
    coverDates: {
      fontFamily: 'Cormorant',
      fontSize: 13,
      color: theme.subtleText,
      textAlign: 'center',
      letterSpacing: 1,
    },
    coverVerse: {
      fontFamily: 'EBGaramond',
      fontStyle: 'italic',
      fontSize: 10,
      color: theme.subtleText,
      textAlign: 'center',
      lineHeight: 1.6,
    },
    coverVenue: {
      fontFamily: 'Cormorant',
      fontSize: 10,
      color: theme.subtleText,
      textAlign: 'center',
      letterSpacing: 0.5,
    },
    // Verse styles
    verseText: {
      fontFamily: 'EBGaramond',
      fontStyle: 'italic',
      fontSize: 12,
      color: theme.subtleText,
      textAlign: 'center',
      lineHeight: 1.8,
      marginBottom: 6,
    },
    verseRef: {
      fontFamily: 'Playfair',
      fontSize: 9,
      color: theme.heading,
      textAlign: 'center',
      letterSpacing: 1,
    },
    // Table styles for order of service
    serviceRow: {
      flexDirection: 'row',
      paddingVertical: 4,
      borderBottomWidth: 0.5,
      borderBottomColor: theme.border,
      borderBottomStyle: 'solid',
      opacity: 0.3,
    },
    serviceTime: {
      fontFamily: 'Playfair',
      fontWeight: 700,
      fontSize: 10,
      color: theme.heading,
      width: 80,
    },
    serviceDesc: {
      fontFamily: 'EBGaramond',
      fontSize: 11,
      color: theme.subtleText,
      flex: 1,
    },
    sectionLabel: {
      fontFamily: 'Playfair',
      fontWeight: 700,
      fontSize: 11,
      color: theme.heading,
      textTransform: 'uppercase',
      letterSpacing: 3,
      marginTop: 14,
      marginBottom: 6,
    },
    // Photo placeholder
    photoPlaceholder: {
      backgroundColor: theme.placeholderBg,
      borderWidth: 1.5,
      borderColor: theme.border,
      borderStyle: 'solid',
      borderRadius: 4,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    photoCaption: {
      fontFamily: 'Cormorant',
      fontStyle: 'italic',
      fontSize: 9,
      color: theme.subtleText,
      textAlign: 'center',
      marginTop: 4,
    },
    // Officials
    officialRole: {
      fontFamily: 'Playfair',
      fontSize: 10,
      color: theme.heading,
      textAlign: 'center',
      textTransform: 'uppercase',
      letterSpacing: 2,
      marginTop: 10,
    },
    officialName: {
      fontFamily: 'EBGaramond',
      fontSize: 12,
      color: theme.subtleText,
      textAlign: 'center',
      marginTop: 2,
    },
    // Ack
    ackSignature: {
      fontFamily: 'Playfair',
      fontWeight: 700,
      fontSize: 14,
      color: theme.heading,
      textAlign: 'center',
      marginTop: 16,
    },
    // Page number
    pageNumber: {
      position: 'absolute',
      bottom: 32,
      left: 0,
      right: 0,
      textAlign: 'center',
      fontFamily: 'Cormorant',
      fontSize: 9,
      color: theme.border,
      letterSpacing: 2,
    },
    // Flex helpers
    flexCenter: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
    },
    spacer: {
      flex: 1,
    },
  })
}
