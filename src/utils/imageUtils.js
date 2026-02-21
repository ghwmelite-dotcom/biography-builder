/**
 * Compress an image file using Canvas API
 * @param {File} file - Image file to compress
 * @param {Object} options - { maxWidth: 800, quality: 0.7 }
 * @returns {Promise<{dataUrl: string, originalSize: number, compressedSize: number}>}
 */
export function compressImage(file, { maxWidth = 800, quality = 0.7 } = {}) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        const dataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve({
          dataUrl,
          originalSize: file.size,
          compressedSize: getBase64Size(dataUrl),
        })
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Crop an image using Canvas API
 * @param {string} imageSrc - Data URL of the image
 * @param {Object} cropRegion - { x, y, width, height } in percentages (0-100)
 * @returns {Promise<string>} Cropped data URL
 */
export function cropImage(imageSrc, cropRegion) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const sx = (cropRegion.x / 100) * img.width
      const sy = (cropRegion.y / 100) * img.height
      const sw = (cropRegion.width / 100) * img.width
      const sh = (cropRegion.height / 100) * img.height
      canvas.width = sw
      canvas.height = sh
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = reject
    img.src = imageSrc
  })
}

/**
 * Get the approximate byte size of a base64 data URL
 * @param {string} dataUrl - Base64 data URL string
 * @returns {number} Approximate size in bytes
 */
export function getBase64Size(dataUrl) {
  const base64 = dataUrl.split(',')[1]
  if (!base64) return 0
  return Math.round((base64.length * 3) / 4)
}

/**
 * Format bytes into a human-readable file size string
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size string (e.g., "1.2 MB")
 */
export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
