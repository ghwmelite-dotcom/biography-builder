export function buildWhatsAppMessage(data, memorialUrl) {
  const lines = []

  lines.push(`\u{1F54A}\uFE0F *${data.title} ${data.fullName}*`)
  lines.push('')

  if (data.dateOfBirth && data.dateOfDeath) {
    const birth = new Date(data.dateOfBirth + 'T00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    const death = new Date(data.dateOfDeath + 'T00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    lines.push(`\u{1F4C5} ${birth} \u2014 ${death}`)
    lines.push('')
  }

  lines.push('*Funeral Service*')
  if (data.funeralDate) {
    const date = new Date(data.funeralDate + 'T00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    lines.push(`\u{1F4C5} ${date}`)
  }
  if (data.funeralTime) {
    const [h, m] = data.funeralTime.split(':')
    const hour = parseInt(h, 10)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    lines.push(`\u{1F550} ${hour > 12 ? hour - 12 : hour || 12}:${m} ${ampm}`)
  }
  if (data.funeralVenue) {
    lines.push(`\u{1F4CD} ${data.funeralVenue}`)
  }
  if (data.burialLocation) {
    lines.push(`\u26EA Burial: ${data.burialLocation}`)
  }

  lines.push('')

  if (memorialUrl) {
    lines.push(`\u{1F517} View Memorial: ${memorialUrl}`)
    lines.push('')
  }

  lines.push('_Rest in Perfect Peace_ \u{1F64F}')

  return lines.join('\n')
}

export function getWhatsAppShareUrl(message) {
  return `https://wa.me/?text=${encodeURIComponent(message)}`
}

export async function generateShareCard(elementRef) {
  const { toPng } = await import('html-to-image')
  return toPng(elementRef, {
    width: 1200,
    height: 630,
    pixelRatio: 2,
  })
}
