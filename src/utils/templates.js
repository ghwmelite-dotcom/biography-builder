import { defaultScriptures, defaultOrderOfService, defaultTributes, defaultBiography, defaultAcknowledgements } from './defaultData'

// Starter templates
export const starterTemplates = {
  fullService: {
    name: 'Full Service',
    description: 'Complete church service with burial',
    icon: 'Church',
    data: {
      coverSubtitle: 'Celebration of Life',
      orderOfService: defaultOrderOfService,
      tributes: defaultTributes,
      biography: defaultBiography,
      acknowledgements: defaultAcknowledgements,
    },
  },
  simpleMemorial: {
    name: 'Simple Memorial',
    description: 'Shorter memorial service',
    icon: 'Flower2',
    data: {
      coverSubtitle: 'In Loving Memory',
      orderOfService: {
        churchService: [
          { time: '10:00 AM', description: 'Opening Hymn' },
          { time: '10:10 AM', description: 'Opening Prayer' },
          { time: '10:20 AM', description: 'Scripture Reading' },
          { time: '10:30 AM', description: 'Biography of the Deceased' },
          { time: '10:45 AM', description: 'Tributes' },
          { time: '11:00 AM', description: 'Musical Selection' },
          { time: '11:10 AM', description: 'Sermon' },
          { time: '11:30 AM', description: 'Closing Prayer & Benediction' },
        ],
        privateBurial: [],
      },
      tributes: [defaultTributes[0], defaultTributes[2]],
      biography: defaultBiography,
      acknowledgements: defaultAcknowledgements,
    },
  },
  gravesideOnly: {
    name: 'Graveside Only',
    description: 'Intimate graveside ceremony',
    icon: 'Cross',
    data: {
      coverSubtitle: 'Graveside Service',
      orderOfService: {
        churchService: [
          { time: '', description: 'Gathering & Processional' },
          { time: '', description: 'Opening Prayer' },
          { time: '', description: 'Scripture Reading' },
          { time: '', description: 'Brief Eulogy' },
          { time: '', description: 'Prayer of Committal' },
          { time: '', description: 'Lowering of Casket' },
          { time: '', description: 'Final Prayers & Benediction' },
          { time: '', description: 'Wreath Laying' },
        ],
        privateBurial: [],
      },
      tributes: [
        {
          id: 'trib-family',
          title: 'Tribute by the Family',
          subtitle: 'In Memory',
          openingVerse: '',
          body: '',
          closingLine: 'Rest in Peace',
        },
      ],
      biography: '',
      acknowledgements: defaultAcknowledgements,
    },
  },
}

// Tribute templates by category
export const tributeTemplates = {
  children: {
    title: 'Tribute by the Children',
    subtitle: 'To Our Beloved Mother/Father',
    openingVerse: '"Her children arise and call her blessed." \u2014 Proverbs 31:28',
  },
  spouse: {
    title: 'Tribute by the Spouse',
    subtitle: 'My Beloved Partner',
    openingVerse: '"Many women do noble things, but you surpass them all." \u2014 Proverbs 31:29',
  },
  grandchildren: {
    title: 'Tribute by the Grandchildren',
    subtitle: 'Our Beloved Grandmother/Grandfather',
    openingVerse: '"Grandchildren are the crown of the aged." \u2014 Proverbs 17:6',
  },
  friends: {
    title: 'Tribute by Friends',
    subtitle: 'A True & Faithful Friend',
    openingVerse: '"A friend loves at all times." \u2014 Proverbs 17:17',
  },
  colleagues: {
    title: 'Tribute by Colleagues',
    subtitle: 'A Shining Star Among Us',
    openingVerse: '"Well done, good and faithful servant." \u2014 Matthew 25:21',
  },
  churchFamily: {
    title: 'Tribute by the Church Family',
    subtitle: 'A Pillar of Our Faith Community',
    openingVerse: '"Blessed are the dead who die in the Lord." \u2014 Revelation 14:13',
  },
}

// Scripture categories
export const scriptureCategories = {
  comfort: {
    name: 'Comfort',
    scriptures: ['psalm23', 'john14', 'revelation21'],
  },
  hope: {
    name: 'Hope',
    scriptures: ['romans8', 'john11', 'thessalonians4'],
  },
  celebration: {
    name: 'Celebration',
    scriptures: ['ecclesiastes3', 'proverbs31', 'psalm116'],
  },
  trust: {
    name: 'Trust',
    scriptures: ['psalm91', 'isaiah41', 'psalm46'],
  },
}

// Additional scriptures beyond defaultData's 5
export const additionalScriptures = {
  romans8: {
    title: 'ROMANS 8:38-39',
    subtitle: 'Nothing Can Separate Us',
    text: 'For I am persuaded, that neither death, nor life, nor angels, nor principalities, nor powers, nor things present, nor things to come, nor height, nor depth, nor any other creature, shall be able to separate us from the love of God, which is in Christ Jesus our Lord.',
  },
  john11: {
    title: 'JOHN 11:25-26',
    subtitle: 'The Resurrection and the Life',
    text: 'Jesus said unto her, I am the resurrection, and the life: he that believeth in me, though he were dead, yet shall he live:\n\nAnd whosoever liveth and believeth in me shall never die. Believest thou this?',
  },
  thessalonians4: {
    title: '1 THESSALONIANS 4:13-14',
    subtitle: 'Hope in Christ',
    text: 'But I would not have you to be ignorant, brethren, concerning them which are asleep, that ye sorrow not, even as others which have no hope.\n\nFor if we believe that Jesus died and rose again, even so them also which sleep in Jesus will God bring with him.',
  },
  proverbs31: {
    title: 'PROVERBS 31:25-31',
    subtitle: 'A Woman of Noble Character',
    text: 'She is clothed with strength and dignity; she can laugh at the days to come.\n\nShe speaks with wisdom, and faithful instruction is on her tongue.\n\nShe watches over the affairs of her household and does not eat the bread of idleness.\n\nHer children arise and call her blessed; her husband also, and he praises her.\n\nMany women do noble things, but you surpass them all.\n\nCharm is deceptive, and beauty is fleeting; but a woman who fears the Lord is to be praised.',
  },
  psalm116: {
    title: 'PSALM 116:15',
    subtitle: 'Precious in His Sight',
    text: 'Precious in the sight of the Lord is the death of his saints.\n\nO Lord, truly I am thy servant; I am thy servant, and the son of thine handmaid: thou hast loosed my bonds.\n\nI will offer to thee the sacrifice of thanksgiving, and will call upon the name of the Lord.',
  },
  isaiah41: {
    title: 'ISAIAH 41:10',
    subtitle: 'Fear Not',
    text: 'Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.',
  },
  psalm46: {
    title: 'PSALM 46:1-3',
    subtitle: 'God is Our Refuge',
    text: 'God is our refuge and strength, a very present help in trouble.\n\nTherefore will not we fear, though the earth be removed, and though the mountains be carried into the midst of the sea;\n\nThough the waters thereof roar and be troubled, though the mountains shake with the swelling thereof.',
  },
}

// Combined scripture lookup (includes both default and additional)
export function getAllScriptures() {
  return { ...defaultScriptures, ...additionalScriptures }
}
