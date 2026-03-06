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

  methodistService: {
    name: 'Methodist Funeral Service',
    description: 'Traditional Methodist funeral with Wesley hymns and liturgy',
    icon: 'Church',
    denomination: 'methodist',
    data: {
      bookletTheme: Object.keys(bookletThemes)[0],
      funeralTime: '9:00 AM',
      orderOfService: [
        { time: '9:00 AM', item: 'Processional Hymn' },
        { time: '9:10 AM', item: 'Opening Sentences & Collect' },
        { time: '9:20 AM', item: 'Psalm 23' },
        { time: '9:30 AM', item: 'First Lesson – 1 Thessalonians 4:13-18' },
        { time: '9:40 AM', item: 'Hymn' },
        { time: '9:50 AM', item: 'Second Lesson – John 14:1-6' },
        { time: '10:00 AM', item: 'Biography of the Deceased' },
        { time: '10:15 AM', item: 'Tributes' },
        { time: '10:40 AM', item: 'Hymn' },
        { time: '10:50 AM', item: 'Sermon' },
        { time: '11:15 AM', item: 'Prayers & Commendation' },
        { time: '11:30 AM', item: 'Recessional' },
      ],
      hymns: [
        {
          title: 'And Can It Be',
          number: 'MHB 371',
          verses: [
            'And can it be that I should gain\nAn interest in the Saviour\'s blood?\nDied He for me, who caused His pain?\nFor me, who Him to death pursued?\nAmazing love! how can it be\nThat Thou, my God, shouldst die for me!',
          ],
        },
        {
          title: 'O God Our Help in Ages Past',
          number: 'MHB 878',
          verses: [
            'O God, our help in ages past,\nOur hope for years to come,\nOur shelter from the stormy blast,\nAnd our eternal home.',
          ],
        },
        {
          title: 'Abide With Me',
          number: 'MHB 948',
          verses: [
            'Abide with me; fast falls the eventide;\nThe darkness deepens; Lord, with me abide!\nWhen other helpers fail and comforts flee,\nHelp of the helpless, O abide with me.',
          ],
        },
        {
          title: 'Guide Me O Thou Great Jehovah',
          number: 'MHB 437',
          verses: [
            'Guide me, O Thou great Jehovah,\nPilgrim through this barren land;\nI am weak, but Thou art mighty;\nHold me with Thy powerful hand;\nBread of heaven, bread of heaven,\nFeed me till I want no more.',
          ],
        },
      ],
      selectedHymns: ['abide-with-me'],
      scriptureKey: 'psalm23',
    },
  },

  catholicRequiem: {
    name: 'Catholic Requiem Mass',
    description: 'Full Catholic Requiem Mass with Eucharistic liturgy',
    icon: 'Cross',
    denomination: 'catholic',
    data: {
      bookletTheme: Object.keys(bookletThemes)[0],
      funeralTime: '9:00 AM',
      orderOfService: [
        { time: '9:00 AM', item: 'Entrance Procession' },
        { time: '9:05 AM', item: 'Sprinkling with Holy Water' },
        { time: '9:10 AM', item: 'Opening Prayer' },
        { time: '9:15 AM', item: 'First Reading – Wisdom 3:1-9' },
        { time: '9:25 AM', item: 'Responsorial Psalm – Psalm 23' },
        { time: '9:30 AM', item: 'Second Reading – Romans 8:35-39' },
        { time: '9:40 AM', item: 'Gospel Acclamation' },
        { time: '9:45 AM', item: 'Gospel – John 11:21-27' },
        { time: '9:55 AM', item: 'Homily' },
        { time: '10:10 AM', item: 'Prayers of the Faithful' },
        { time: '10:20 AM', item: 'Offertory' },
        { time: '10:30 AM', item: 'Eucharistic Prayer' },
        { time: '10:50 AM', item: 'Communion' },
        { time: '11:05 AM', item: 'Final Commendation' },
        { time: '11:15 AM', item: 'Recessional' },
      ],
      hymns: [
        {
          title: 'How Great Thou Art',
          number: '',
          verses: [
            'O Lord my God, when I in awesome wonder\nConsider all the worlds Thy hands have made,\nI see the stars, I hear the rolling thunder,\nThy power throughout the universe displayed.',
          ],
        },
        {
          title: 'Be Not Afraid',
          number: '',
          verses: [
            'You shall cross the barren desert,\nbut you shall not die of thirst.\nYou shall wander far in safety\nthough you do not know the way.\nBe not afraid. I go before you always.\nCome, follow me, and I will give you rest.',
          ],
        },
        {
          title: 'On Eagle\'s Wings',
          number: '',
          verses: [
            'You who dwell in the shelter of the Lord,\nWho abide in His shadow for life,\nSay to the Lord: "My refuge, my rock in whom I trust!"\nAnd He will raise you up on eagle\'s wings,\nBear you on the breath of dawn,\nMake you to shine like the sun,\nAnd hold you in the palm of His hand.',
          ],
        },
        {
          title: 'Ave Maria',
          number: '',
          verses: [
            'Ave Maria, gratia plena,\nDominus tecum.\nBenedicta tu in mulieribus,\net benedictus fructus ventris tui, Iesus.\nSancta Maria, Mater Dei,\nora pro nobis peccatoribus,\nnunc et in hora mortis nostrae. Amen.',
          ],
        },
      ],
      selectedHymns: ['how-great-thou-art'],
      scriptureKey: 'psalm23',
    },
  },

  presbyterianService: {
    name: 'Presbyterian Church of Ghana Funeral',
    description: 'Presbyterian Church of Ghana funeral service order',
    icon: 'Church',
    denomination: 'presbyterian',
    data: {
      bookletTheme: Object.keys(bookletThemes)[0],
      funeralTime: '9:00 AM',
      orderOfService: [
        { time: '9:00 AM', item: 'Processional Hymn' },
        { time: '9:10 AM', item: 'Call to Worship' },
        { time: '9:15 AM', item: 'Invocation & Lord\'s Prayer' },
        { time: '9:25 AM', item: 'Hymn' },
        { time: '9:35 AM', item: 'Scripture Reading – Old Testament' },
        { time: '9:45 AM', item: 'Scripture Reading – New Testament' },
        { time: '9:55 AM', item: 'Hymn' },
        { time: '10:05 AM', item: 'Biography of the Deceased' },
        { time: '10:20 AM', item: 'Tributes' },
        { time: '10:45 AM', item: 'Hymn' },
        { time: '10:55 AM', item: 'Sermon' },
        { time: '11:20 AM', item: 'Prayers of Thanksgiving & Intercession' },
        { time: '11:30 AM', item: 'Offering' },
        { time: '11:35 AM', item: 'Closing Hymn' },
        { time: '11:40 AM', item: 'Benediction & Recessional' },
      ],
      hymns: [
        {
          title: 'The Lord\'s My Shepherd',
          number: 'HP 17',
          verses: [
            'The Lord\'s my Shepherd, I\'ll not want;\nHe makes me down to lie\nIn pastures green; He leadeth me\nThe quiet waters by.',
          ],
        },
        {
          title: 'Rock of Ages',
          number: 'HP 218',
          verses: [
            'Rock of Ages, cleft for me,\nLet me hide myself in Thee;\nLet the water and the blood,\nFrom Thy wounded side which flowed,\nBe of sin the double cure,\nSave from wrath and make me pure.',
          ],
        },
        {
          title: 'Nearer My God to Thee',
          number: 'HP 312',
          verses: [
            'Nearer, my God, to Thee, nearer to Thee!\nE\'en though it be a cross that raiseth me;\nStill all my song shall be, nearer, my God, to Thee,\nNearer, my God, to Thee, nearer to Thee!',
          ],
        },
        {
          title: 'It Is Well With My Soul',
          number: '',
          verses: [
            'When peace like a river attendeth my way,\nWhen sorrows like sea billows roll;\nWhatever my lot, Thou hast taught me to say,\nIt is well, it is well with my soul.',
          ],
        },
      ],
      selectedHymns: ['rock-of-ages', 'nearer-my-god', 'it-is-well'],
      scriptureKey: 'psalm23',
    },
  },

  pentecostalCelebration: {
    name: 'Pentecostal Celebration of Life',
    description: 'Praise and worship focused celebration of life service',
    icon: 'Sparkles',
    denomination: 'pentecostal',
    data: {
      bookletTheme: Object.keys(bookletThemes)[0],
      funeralTime: '9:00 AM',
      orderOfService: [
        { time: '9:00 AM', item: 'Praise & Worship' },
        { time: '9:20 AM', item: 'Opening Prayer' },
        { time: '9:30 AM', item: 'Scripture Reading' },
        { time: '9:40 AM', item: 'Special Song' },
        { time: '9:50 AM', item: 'Biography of the Deceased' },
        { time: '10:05 AM', item: 'Tributes' },
        { time: '10:30 AM', item: 'Ministration in Song' },
        { time: '10:45 AM', item: 'Sermon' },
        { time: '11:15 AM', item: 'Altar Call' },
        { time: '11:25 AM', item: 'Closing Prayer' },
        { time: '11:30 AM', item: 'Benediction' },
      ],
      hymns: [
        {
          title: 'Way Maker',
          number: '',
          verses: [
            'You are here, moving in our midst;\nI worship You, I worship You.\nYou are here, working in this place;\nI worship You, I worship You.\nWay maker, miracle worker, promise keeper,\nLight in the darkness, my God, that is who You are.',
          ],
        },
        {
          title: 'Great Are You Lord',
          number: '',
          verses: [
            'You give life, You are love,\nYou bring light to the darkness.\nYou give hope, You restore every heart that is broken.\nGreat are You, Lord.',
          ],
        },
        {
          title: 'It Is Well',
          number: '',
          verses: [
            'When peace like a river attendeth my way,\nWhen sorrows like sea billows roll;\nWhatever my lot, Thou hast taught me to say,\nIt is well, it is well with my soul.',
          ],
        },
        {
          title: 'Blessed Assurance',
          number: '',
          verses: [
            'Blessed assurance, Jesus is mine!\nO what a foretaste of glory divine!\nHeir of salvation, purchase of God,\nBorn of His Spirit, washed in His blood.',
          ],
        },
      ],
      selectedHymns: ['it-is-well', 'blessed-assurance'],
      scriptureKey: 'psalm23',
    },
  },

  charismaticHomegoing: {
    name: 'Charismatic Homegoing Service',
    description: 'Spirit-led homegoing celebration with spontaneous worship',
    icon: 'Sparkles',
    denomination: 'charismatic',
    data: {
      bookletTheme: Object.keys(bookletThemes)[0],
      funeralTime: '9:00 AM',
      orderOfService: [
        { time: '9:00 AM', item: 'Praise & Worship' },
        { time: '9:20 AM', item: 'Spontaneous Worship & Prayer' },
        { time: '9:35 AM', item: 'Prophetic Declarations' },
        { time: '9:45 AM', item: 'Scripture Reading' },
        { time: '9:55 AM', item: 'Special Song' },
        { time: '10:05 AM', item: 'Biography of the Deceased' },
        { time: '10:20 AM', item: 'Tributes' },
        { time: '10:45 AM', item: 'Worship & Ministration in Song' },
        { time: '11:00 AM', item: 'Sermon' },
        { time: '11:30 AM', item: 'Altar Call & Prayer' },
        { time: '11:40 AM', item: 'Closing Declarations & Benediction' },
      ],
      hymns: [
        {
          title: 'You Are Good',
          number: '',
          verses: [
            'Lord, You are good and Your mercy endureth forever.\nLord, You are good and Your mercy endureth forever.\nPeople from every nation and tongue,\nFrom generation to generation,\nWe worship You, hallelujah, hallelujah!\nWe worship You for who You are.',
          ],
        },
        {
          title: 'Waymaker',
          number: '',
          verses: [
            'You are here, moving in our midst;\nI worship You, I worship You.\nYou are here, working in this place;\nI worship You, I worship You.\nWay maker, miracle worker, promise keeper,\nLight in the darkness, my God, that is who You are.',
          ],
        },
        {
          title: 'No Longer Slaves',
          number: '',
          verses: [
            'You unravel me with a melody,\nYou surround me with a song\nOf deliverance from my enemies\nTill all my fears are gone.\nI\'m no longer a slave to fear,\nI am a child of God.',
          ],
        },
        {
          title: 'What A Beautiful Name',
          number: '',
          verses: [
            'You were the Word at the beginning,\nOne with God the Lord Most High.\nYour hidden glory in creation,\nNow revealed in You our Christ.\nWhat a beautiful Name it is,\nWhat a beautiful Name it is,\nThe Name of Jesus Christ my King.',
          ],
        },
      ],
      selectedHymns: [],
      scriptureKey: 'psalm23',
    },
  },

  adventistMemorial: {
    name: 'SDA Memorial Service',
    description: 'Seventh-day Adventist memorial service with hope in the resurrection',
    icon: 'Church',
    denomination: 'adventist',
    data: {
      bookletTheme: Object.keys(bookletThemes)[0],
      funeralTime: '9:00 AM',
      orderOfService: [
        { time: '9:00 AM', item: 'Processional Hymn' },
        { time: '9:10 AM', item: 'Opening Prayer & Invocation' },
        { time: '9:20 AM', item: 'Congregational Hymn' },
        { time: '9:30 AM', item: 'Scripture Reading – 1 Thessalonians 4:13-18' },
        { time: '9:40 AM', item: 'Prayer of Comfort' },
        { time: '9:50 AM', item: 'Special Music' },
        { time: '10:00 AM', item: 'Biography of the Deceased' },
        { time: '10:15 AM', item: 'Tributes' },
        { time: '10:40 AM', item: 'Congregational Hymn' },
        { time: '10:50 AM', item: 'Sermon – The Blessed Hope' },
        { time: '11:20 AM', item: 'Closing Hymn' },
        { time: '11:30 AM', item: 'Benediction & Committal Prayer' },
        { time: '11:35 AM', item: 'Recessional' },
      ],
      hymns: [
        {
          title: 'Amazing Grace',
          number: 'SDA 108',
          verses: [
            'Amazing grace! how sweet the sound,\nThat saved a wretch like me!\nI once was lost, but now am found,\nWas blind, but now I see.',
          ],
        },
        {
          title: 'How Great Thou Art',
          number: 'SDA 86',
          verses: [
            'O Lord my God, when I in awesome wonder\nConsider all the worlds Thy hands have made,\nI see the stars, I hear the rolling thunder,\nThy power throughout the universe displayed.',
          ],
        },
        {
          title: 'A Mighty Fortress',
          number: 'SDA 506',
          verses: [
            'A mighty fortress is our God,\nA bulwark never failing;\nOur helper He amid the flood\nOf mortal ills prevailing.',
          ],
        },
        {
          title: 'Blessed Assurance',
          number: 'SDA 462',
          verses: [
            'Blessed assurance, Jesus is mine!\nO what a foretaste of glory divine!\nHeir of salvation, purchase of God,\nBorn of His Spirit, washed in His blood.',
          ],
        },
      ],
      selectedHymns: ['amazing-grace', 'how-great-thou-art', 'blessed-assurance'],
      scriptureKey: 'revelation21',
    },
  },

  anglicanBurial: {
    name: 'Anglican Burial Service',
    description: 'Traditional Anglican burial office from the Book of Common Prayer',
    icon: 'Cross',
    denomination: 'anglican',
    data: {
      bookletTheme: Object.keys(bookletThemes)[0],
      funeralTime: '9:00 AM',
      orderOfService: [
        { time: '9:00 AM', item: 'Reception of the Body & Sentences' },
        { time: '9:10 AM', item: 'Processional Hymn' },
        { time: '9:20 AM', item: 'The Collect' },
        { time: '9:25 AM', item: 'Psalm 39 or Psalm 90' },
        { time: '9:35 AM', item: 'First Lesson – Ecclesiastes 3:1-11' },
        { time: '9:45 AM', item: 'Hymn' },
        { time: '9:55 AM', item: 'Second Lesson – 1 Corinthians 15:20-58' },
        { time: '10:05 AM', item: 'The Apostles\' Creed' },
        { time: '10:10 AM', item: 'Biography of the Deceased' },
        { time: '10:25 AM', item: 'Tributes' },
        { time: '10:50 AM', item: 'Hymn' },
        { time: '11:00 AM', item: 'Sermon' },
        { time: '11:20 AM', item: 'Prayers & Lesser Litany' },
        { time: '11:30 AM', item: 'The Commendation' },
        { time: '11:35 AM', item: 'Closing Hymn' },
        { time: '11:40 AM', item: 'The Committal & Blessing' },
        { time: '11:45 AM', item: 'Recessional' },
      ],
      hymns: [
        {
          title: 'The Day Thou Gavest',
          number: 'A&M 477',
          verses: [
            'The day Thou gavest, Lord, is ended,\nThe darkness falls at Thy behest;\nTo Thee our morning hymns ascended,\nThy praise shall sanctify our rest.',
          ],
        },
        {
          title: 'Love Divine',
          number: 'A&M 408',
          verses: [
            'Love divine, all loves excelling,\nJoy of heaven, to earth come down,\nFix in us Thy humble dwelling,\nAll Thy faithful mercies crown.',
          ],
        },
        {
          title: 'Dear Lord and Father',
          number: 'A&M 353',
          verses: [
            'Dear Lord and Father of mankind,\nForgive our foolish ways!\nReclothe us in our rightful mind,\nIn purer lives Thy service find,\nIn deeper reverence, praise.',
          ],
        },
        {
          title: 'Abide With Me',
          number: 'A&M 27',
          verses: [
            'Abide with me; fast falls the eventide;\nThe darkness deepens; Lord, with me abide!\nWhen other helpers fail and comforts flee,\nHelp of the helpless, O abide with me.',
          ],
        },
      ],
      selectedHymns: ['abide-with-me'],
      scriptureKey: 'psalm23',
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
