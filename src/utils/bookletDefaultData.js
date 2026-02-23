import { themes } from './themes'

// Adapt brochure themes to booklet format
function adaptBrochureTheme(t, layout) {
  return {
    name: t.name,
    description: t.description || '',
    layout,
    headerBg: t.pageBg,
    bodyBg: t.secondaryBg || t.pageBg,
    accent: t.accent,
    detailsBg: t.secondaryBg || t.pageBg,
    detailsText: t.bodyText,
    footerBg: t.pageBg,
    headerText: t.cream || '#FFFFFF',
    nameText: t.heading,
    bodyText: t.bodyText,
    divider: t.gold || t.accent,
    badgeBg: t.gold || t.accent,
    badgeText: t.pageBg,
  }
}

const layoutCycle = ['classic', 'elegant', 'modern', 'classic', 'elegant', 'modern', 'classic', 'elegant', 'modern']

export const bookletThemes = {}
Object.keys(themes).forEach((key, i) => {
  bookletThemes[key] = adaptBrochureTheme(themes[key], layoutCycle[i % layoutCycle.length])
})

export function getBookletTheme(key) {
  return bookletThemes[key] || bookletThemes[Object.keys(bookletThemes)[0]]
}

export const bookletTemplates = {
  fullChurchService: {
    name: 'Full Church Service',
    description: 'Complete church funeral programme with hymns and readings',
    icon: 'Church',
    data: {
      bookletTheme: Object.keys(bookletThemes)[0],
      funeralTime: '9:00 AM',
      orderOfService: [
        { time: '9:00 AM', item: 'Arrival of Body & Seating of Family' },
        { time: '9:10 AM', item: 'Opening Hymn' },
        { time: '9:20 AM', item: 'Opening Prayer' },
        { time: '9:30 AM', item: 'Scripture Reading' },
        { time: '9:45 AM', item: 'Biography of the Deceased' },
        { time: '10:00 AM', item: 'Tributes' },
        { time: '10:30 AM', item: 'Sermon' },
        { time: '11:00 AM', item: 'Closing Hymn & Benediction' },
      ],
      selectedHymns: ['amazing-grace', 'abide-with-me'],
      scriptureKey: 'psalm23',
    },
  },
  simpleGraveside: {
    name: 'Simple Graveside',
    description: 'Brief graveside service programme',
    icon: 'BookOpen',
    data: {
      bookletTheme: Object.keys(bookletThemes)[0],
      orderOfService: [
        { time: '', item: 'Gathering & Welcome' },
        { time: '', item: 'Scripture Reading' },
        { time: '', item: 'Prayer' },
        { time: '', item: 'Committal' },
        { time: '', item: 'Benediction' },
      ],
      selectedHymns: ['it-is-well'],
      scriptureKey: 'revelation21',
    },
  },
  celebrationOfLife: {
    name: 'Celebration of Life',
    description: 'Uplifting celebration with music and memories',
    icon: 'Heart',
    data: {
      bookletTheme: Object.keys(bookletThemes)[0],
      orderOfService: [
        { time: '', item: 'Musical Prelude' },
        { time: '', item: 'Welcome & Opening' },
        { time: '', item: 'Photo Slideshow' },
        { time: '', item: 'Memory Sharing' },
        { time: '', item: 'Musical Tribute' },
        { time: '', item: 'Closing Remarks' },
      ],
      selectedHymns: ['how-great-thou-art', 'blessed-assurance'],
      scriptureKey: 'ecclesiastes3',
    },
  },
}

export const bookletDefaultData = {
  bookletTheme: Object.keys(bookletThemes)[0],
  fullName: '',
  alias: '',
  photo: null,
  dateOfBirth: '',
  dateOfDeath: '',
  age: '',
  funeralDate: '',
  funeralTime: '',
  venue: '',
  venueAddress: '',
  orderOfService: [{ time: '', item: '' }],
  selectedHymns: [],
  scriptureKey: '',
  customScripture: '',
  officiant: '',
  churchName: '',
  customBackText: '',
}
