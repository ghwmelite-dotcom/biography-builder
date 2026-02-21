export function generateSlides(store) {
  const slides = []

  // Slide 1: Cover
  slides.push({
    type: 'cover',
    title: `${store.title} ${store.fullName}`,
    subtitle: store.coverSubtitle || 'Celebration of Life',
    image: store.coverPhoto,
    dateOfBirth: store.dateOfBirth,
    dateOfDeath: store.dateOfDeath,
  })

  // Slide 2: Cover verse
  if (store.coverVerse) {
    slides.push({
      type: 'verse',
      text: store.coverVerse,
    })
  }

  // Slide 3: Biography excerpt
  if (store.biography) {
    const paragraphs = store.biography.split('\n\n')
    const excerpt = paragraphs.slice(0, 2).join('\n\n')
    slides.push({
      type: 'text',
      heading: 'Biography',
      text: excerpt,
    })
  }

  // Slides 4+: Gallery photos
  const photosWithSrc = (store.galleryPhotos || []).filter(p => p?.src)
  photosWithSrc.forEach((photo, i) => {
    slides.push({
      type: 'photo',
      image: photo.src,
      caption: photo.caption || '',
      heading: i === 0 ? 'Treasured Memories' : '',
    })
  })

  // Biography photos
  const bioPhotos = (store.biographyPhotos || []).filter(Boolean)
  bioPhotos.forEach((photo, i) => {
    slides.push({
      type: 'photo',
      image: photo,
      caption: store.biographyPhotoCaptions?.[i] || '',
    })
  })

  // Tribute quotes
  if (store.tributes && store.tributes.length > 0) {
    store.tributes.slice(0, 3).forEach((tribute) => {
      if (tribute.body) {
        // Take first 2 sentences
        const sentences = tribute.body.split(/[.!?]+/).filter(s => s.trim())
        const quote = sentences.slice(0, 2).join('. ').trim() + '.'
        slides.push({
          type: 'quote',
          text: quote,
          author: tribute.title || '',
        })
      }
    })
  }

  // Closing slide
  slides.push({
    type: 'closing',
    title: store.backCoverPhrase || 'Rest in Perfect Peace',
    subtitle: store.backCoverSubtext || '',
    verse: store.backCoverVerse || '',
    image: store.coverPhoto,
  })

  return slides
}
