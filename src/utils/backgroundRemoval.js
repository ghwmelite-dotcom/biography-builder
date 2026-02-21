let removeBackground = null

export async function loadBackgroundRemoval() {
  if (!removeBackground) {
    const module = await import('@imgly/background-removal')
    removeBackground = module.removeBackground
  }
  return removeBackground
}

export async function removeImageBackground(imageDataUrl, onProgress) {
  const removeBg = await loadBackgroundRemoval()

  // Convert data URL to blob
  const response = await fetch(imageDataUrl)
  const blob = await response.blob()

  const result = await removeBg(blob, {
    progress: (key, current, total) => {
      if (onProgress) onProgress(Math.round((current / total) * 100))
    },
  })

  // Convert result blob to data URL
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.readAsDataURL(result)
  })
}
