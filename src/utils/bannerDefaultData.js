import { posterThemes } from './posterDefaultData'

export const bannerThemes = { ...posterThemes }

export function getBannerTheme(key) {
  return bannerThemes[key] || bannerThemes.royalBlue
}

export const bannerTemplates = {
  inLovingMemory: {
    name: 'In Loving Memory',
    description: 'Classic memorial banner with scripture',
    icon: 'Heart',
    data: {
      bannerTheme: 'royalBlue',
      headerTitle: 'IN LOVING MEMORY OF',
      scriptureVerse: 'The Lord is my shepherd; I shall not want. He maketh me to lie down in green pastures: He leadeth me beside the still waters.',
      scriptureRef: 'Psalm 23:1-2',
      familyText: 'Gone but never forgotten. Forever in our hearts.',
    },
  },
  celebrationOfLife: {
    name: 'Celebration of Life',
    description: 'Uplifting celebration banner',
    icon: 'Sparkles',
    data: {
      bannerTheme: 'forestGreen',
      headerTitle: 'CELEBRATION OF LIFE',
      scriptureVerse: 'I have fought the good fight, I have finished the race, I have kept the faith.',
      scriptureRef: '2 Timothy 4:7',
      familyText: 'A life beautifully lived, a legacy that endures forever.',
    },
  },
  sunriseSunset: {
    name: 'Sunrise Sunset',
    description: 'Birth to rest eternal design',
    icon: 'BookOpen',
    data: {
      bannerTheme: 'midnightBlack',
      headerTitle: 'SUNRISE — SUNSET',
      scriptureVerse: 'To every thing there is a season, and a time to every purpose under the heaven: A time to be born, and a time to die.',
      scriptureRef: 'Ecclesiastes 3:1-2',
      familyText: 'Rest in perfect peace until we meet again.',
    },
  },
  funeralHomeBanner: {
    name: 'Funeral Home Branded',
    description: 'Professional banner with funeral home branding',
    icon: 'Building2',
    institutional: true,
    data: {
      bannerTheme: 'royalBlue',
      headerTitle: 'IN LOVING MEMORY OF',
      scriptureVerse: 'Blessed are those who mourn, for they shall be comforted.',
      scriptureRef: 'Matthew 5:4',
      familyText: 'Professional funeral services provided with care and dignity.',
    },
  },
  funeralHomeElegantBanner: {
    name: 'Funeral Home Elegant',
    description: 'Elegant branded banner for funeral homes',
    icon: 'Building2',
    institutional: true,
    data: {
      bannerTheme: 'burgundyIvory',
      headerTitle: 'A LIFE WELL LIVED',
      scriptureVerse: 'The memory of the righteous is a blessing.',
      scriptureRef: 'Proverbs 10:7',
      familyText: 'Honoring lives with dignity and grace.',
    },
  },
}

export const bannerDefaultData = {
  bannerTheme: 'royalBlue',
  fullName: '',
  alias: '',
  photo: null,
  dateOfBirth: '',
  dateOfDeath: '',
  age: '',
  scriptureVerse: '',
  scriptureRef: '',
  familyText: '',
  headerTitle: 'IN LOVING MEMORY OF',
}
