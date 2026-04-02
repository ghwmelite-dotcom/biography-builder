/**
 * Apply a diagonal "Created with FuneralPress" watermark to a data URL image.
 * Returns a new data URL with the watermark overlaid.
 */
export async function applyWatermark(dataUrl) {
  const img = await loadImage(dataUrl)
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')

  ctx.drawImage(img, 0, 0)

  ctx.save()
  ctx.translate(canvas.width / 2, canvas.height / 2)
  ctx.rotate(-Math.PI / 6)

  const fontSize = Math.max(canvas.width / 20, 24)
  ctx.font = `bold ${fontSize}px sans-serif`
  ctx.fillStyle = 'rgba(200, 168, 76, 0.15)'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const text = 'Created with FuneralPress'
  const lineHeight = fontSize * 3
  for (let y = -canvas.height; y < canvas.height * 2; y += lineHeight) {
    ctx.fillText(text, 0, y)
  }

  ctx.restore()
  return canvas.toDataURL('image/png')
}

export function shouldApplyWatermark(isUnlocked, hasSubscription, isUnlimited) {
  if (isUnlocked) return false
  if (hasSubscription) return false
  if (isUnlimited) return false
  return true
}

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new window.Image()
    img.onload = () => resolve(img)
    img.src = src
  })
}
