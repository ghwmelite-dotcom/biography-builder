export const hymnCategories = {
  traditional: 'Traditional',
  contemporary: 'Contemporary',
  african: 'African',
  gospel: 'Gospel',
}

export const hymns = [
  { id: 'amazing-grace', title: 'Amazing Grace', author: 'John Newton', category: 'traditional', firstLine: 'Amazing grace, how sweet the sound...' },
  { id: 'abide-with-me', title: 'Abide with Me', author: 'Henry F. Lyte', category: 'traditional', firstLine: 'Abide with me, fast falls the eventide...' },
  { id: 'rock-of-ages', title: 'Rock of Ages', author: 'Augustus Toplady', category: 'traditional', firstLine: 'Rock of Ages, cleft for me...' },
  { id: 'nearer-my-god', title: 'Nearer, My God, to Thee', author: 'Sarah Adams', category: 'traditional', firstLine: 'Nearer, my God, to Thee, nearer to Thee...' },
  { id: 'be-still-my-soul', title: 'Be Still, My Soul', author: 'Katharina von Schlegel', category: 'traditional', firstLine: 'Be still, my soul: the Lord is on thy side...' },
  { id: 'it-is-well', title: 'It Is Well with My Soul', author: 'Horatio Spafford', category: 'traditional', firstLine: 'When peace like a river attendeth my way...' },
  { id: 'great-is-thy-faithfulness', title: 'Great Is Thy Faithfulness', author: 'Thomas Chisholm', category: 'traditional', firstLine: 'Great is Thy faithfulness, O God my Father...' },
  { id: 'blessed-assurance', title: 'Blessed Assurance', author: 'Fanny Crosby', category: 'traditional', firstLine: 'Blessed assurance, Jesus is mine...' },
  { id: 'how-great-thou-art', title: 'How Great Thou Art', author: 'Stuart Hine', category: 'traditional', firstLine: 'O Lord my God, when I in awesome wonder...' },
  { id: 'the-old-rugged-cross', title: 'The Old Rugged Cross', author: 'George Bennard', category: 'traditional', firstLine: 'On a hill far away stood an old rugged cross...' },
  { id: 'going-home', title: 'Going Home', author: 'Anton\u00edn Dvo\u0159\u00e1k', category: 'contemporary', firstLine: 'Going home, going home, I am going home...' },
  { id: 'in-the-garden', title: 'In the Garden', author: 'C. Austin Miles', category: 'contemporary', firstLine: 'I come to the garden alone...' },
  { id: 'precious-lord', title: 'Precious Lord, Take My Hand', author: 'Thomas A. Dorsey', category: 'gospel', firstLine: 'Precious Lord, take my hand, lead me on...' },
  { id: 'his-eye-sparrow', title: 'His Eye Is on the Sparrow', author: 'Civilla Martin', category: 'gospel', firstLine: 'Why should I feel discouraged...' },
  { id: 'ill-fly-away', title: "I'll Fly Away", author: 'Albert E. Brumley', category: 'gospel', firstLine: 'Some glad morning when this life is over...' },
  { id: 'stand-by-me', title: 'Stand by Me', author: 'Charles Tindley', category: 'gospel', firstLine: 'When the storms of life are raging, stand by me...' },
  { id: 'ose-yie', title: 'Ose Yie (He Has Done Well)', author: 'Ghanaian Hymn', category: 'african', firstLine: 'Ose yie, ose yie, Awurade ose yie...' },
  { id: 'yesu-mo', title: 'Yesu Mo (Jesus Loves)', author: 'Ghanaian Hymn', category: 'african', firstLine: 'Yesu mo, Yesu mo, Yesu mo me pa...' },
  { id: 'nyame-ye-ohene', title: 'Nyame Ye Ohene (God is King)', author: 'Ghanaian Hymn', category: 'african', firstLine: 'Nyame ye Ohene, Nyame ye Ohene...' },
  { id: 'me-nkwa-nyinaa', title: 'Me Nkwa Nyinaa (All My Life)', author: 'Ghanaian Hymn', category: 'african', firstLine: 'Me nkwa nyinaa, me de ma wo...' },
  { id: 'onipa-yieye', title: 'Onipa Yieye (Good Person)', author: 'Ghanaian Hymn', category: 'african', firstLine: 'Onipa yieye wu a, na oman asa...' },
  { id: 'what-a-friend', title: 'What a Friend We Have in Jesus', author: 'Joseph Scriven', category: 'traditional', firstLine: 'What a friend we have in Jesus...' },
]

export function getHymnsByCategory(category) {
  if (!category || category === 'all') return hymns
  return hymns.filter((h) => h.category === category)
}
