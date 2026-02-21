export function applyFilter(imageDataUrl, filterType, options = {}) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      switch (filterType) {
        case 'sepia':
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i + 1], b = data[i + 2]
            data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189)
            data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168)
            data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131)
          }
          break

        case 'grayscale':
          for (let i = 0; i < data.length; i += 4) {
            const avg = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
            data[i] = data[i + 1] = data[i + 2] = avg
          }
          break

        case 'warmTone':
          for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, data[i] + 15)
            data[i + 1] = Math.min(255, data[i + 1] + 5)
            data[i + 2] = Math.max(0, data[i + 2] - 10)
          }
          break

        case 'coolTone':
          for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.max(0, data[i] - 10)
            data[i + 1] = Math.min(255, data[i + 1] + 5)
            data[i + 2] = Math.min(255, data[i + 2] + 15)
          }
          break

        case 'brightness': {
          const amount = options.amount || 20
          for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, Math.max(0, data[i] + amount))
            data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + amount))
            data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + amount))
          }
          break
        }

        case 'contrast': {
          const factor = (259 * ((options.amount || 30) + 255)) / (255 * (259 - (options.amount || 30)))
          for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128))
            data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128))
            data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128))
          }
          break
        }

        case 'sharpen': {
          // Simple unsharp mask
          const w = canvas.width
          const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0]
          const src = new Uint8ClampedArray(data)
          for (let y = 1; y < canvas.height - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
              for (let c = 0; c < 3; c++) {
                let val = 0
                for (let ky = -1; ky <= 1; ky++) {
                  for (let kx = -1; kx <= 1; kx++) {
                    val += src[((y + ky) * w + (x + kx)) * 4 + c] * kernel[(ky + 1) * 3 + (kx + 1)]
                  }
                }
                data[(y * w + x) * 4 + c] = Math.min(255, Math.max(0, val))
              }
            }
          }
          break
        }

        case 'autoEnhance':
          // Slight brightness + contrast + warmth
          for (let i = 0; i < data.length; i += 4) {
            // Brightness +10
            let r = Math.min(255, data[i] + 10)
            let g = Math.min(255, data[i + 1] + 10)
            let b = Math.min(255, data[i + 2] + 10)
            // Contrast factor 1.1
            const f = 1.1
            r = Math.min(255, Math.max(0, f * (r - 128) + 128))
            g = Math.min(255, Math.max(0, f * (g - 128) + 128))
            b = Math.min(255, Math.max(0, f * (b - 128) + 128))
            // Slight warmth
            data[i] = Math.min(255, r + 5)
            data[i + 1] = g
            data[i + 2] = Math.max(0, b - 5)
          }
          break
      }

      ctx.putImageData(imageData, 0, 0)
      resolve(canvas.toDataURL('image/jpeg', 0.9))
    }
    img.src = imageDataUrl
  })
}

export const FILTER_PRESETS = [
  { key: 'autoEnhance', label: 'Auto Enhance', icon: '✨' },
  { key: 'sepia', label: 'Sepia', icon: '🟤' },
  { key: 'grayscale', label: 'B&W', icon: '⬛' },
  { key: 'warmTone', label: 'Warm', icon: '🔥' },
  { key: 'coolTone', label: 'Cool', icon: '❄️' },
  { key: 'sharpen', label: 'Sharpen', icon: '🔍' },
]
