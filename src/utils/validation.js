// Section completion rules:
// basic: fullName + dateOfBirth + dateOfDeath + funeralDate + funeralVenue all filled
// cover: coverSubtitle + coverVerse filled
// scripture: scriptureKey selected (and if custom, customScripture has text)
// officials: at least 1 minister with both role + name filled
// service: at least 3 churchService items with descriptions
// biography: 50+ words
// tributes: at least 1 tribute with title + 20+ word body
// gallery: at least 1 photo uploaded (src not null)
// ack: acknowledgements has 20+ words
// back: backCoverPhrase filled

export function isSectionComplete(key, state) {
  switch (key) {
    case 'basic':
      return Boolean(
        state.fullName?.trim() &&
        state.dateOfBirth &&
        state.dateOfDeath &&
        state.funeralDate &&
        state.funeralVenue?.trim()
      )
    case 'cover':
      return Boolean(state.coverSubtitle?.trim() && state.coverVerse?.trim())
    case 'scripture': {
      if (state.scriptureKey === 'custom') return Boolean(state.customScripture?.trim())
      return Boolean(state.scriptureKey)
    }
    case 'officials':
      return state.officials?.ministers?.some(m => m.role?.trim() && m.name?.trim()) ?? false
    case 'service': {
      const items = state.orderOfService?.churchService || []
      return items.filter(i => i.description?.trim()).length >= 3
    }
    case 'biography':
      return wordCount(state.biography) >= 50
    case 'tributes':
      return state.tributes?.some(t => t.title?.trim() && wordCount(t.body) >= 20) ?? false
    case 'gallery':
      return state.galleryPhotos?.some(p => p.src) ?? false
    case 'ack':
      return wordCount(state.acknowledgements) >= 20
    case 'back':
      return Boolean(state.backCoverPhrase?.trim())
    default:
      return false
  }
}

export function getSectionCompletionCount(state) {
  const keys = ['basic', 'cover', 'scripture', 'officials', 'service', 'biography', 'tributes', 'gallery', 'ack', 'back']
  let completed = 0
  for (const key of keys) {
    if (isSectionComplete(key, state)) completed++
  }
  return { completed, total: keys.length }
}

function wordCount(text) {
  if (!text) return 0
  return text.split(/\s+/).filter(Boolean).length
}

// Field-level validation
export function validateField(field, value, allValues = {}) {
  const required = ['fullName', 'dateOfBirth', 'dateOfDeath', 'funeralDate', 'funeralVenue']
  if (required.includes(field) && !value?.toString().trim()) {
    return { valid: false, error: 'This field is required' }
  }
  // Date range check: dateOfDeath should be after dateOfBirth
  if (field === 'dateOfDeath' && allValues.dateOfBirth && value && value < allValues.dateOfBirth) {
    return { valid: false, error: 'Must be after date of birth' }
  }
  // Funeral date should be after date of death
  if (field === 'funeralDate' && allValues.dateOfDeath && value && value < allValues.dateOfDeath) {
    return { valid: false, error: 'Must be after date of death' }
  }
  return { valid: true, error: null }
}
