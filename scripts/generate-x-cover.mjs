import { createCanvas, GlobalFonts } from '@napi-rs/canvas'
import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const FONTS_DIR = 'C:\\Users\\USER\\.claude\\plugins\\cache\\anthropic-agent-skills\\document-skills\\3d5951151859\\skills\\canvas-design\\canvas-fonts'

// Register fonts
GlobalFonts.registerFromPath(join(FONTS_DIR, 'Italiana-Regular.ttf'), 'Italiana')
GlobalFonts.registerFromPath(join(FONTS_DIR, 'WorkSans-Regular.ttf'), 'WorkSans')
GlobalFonts.registerFromPath(join(FONTS_DIR, 'WorkSans-Bold.ttf'), 'WorkSansBold')
GlobalFonts.registerFromPath(join(FONTS_DIR, 'Lora-Regular.ttf'), 'Lora')
GlobalFonts.registerFromPath(join(FONTS_DIR, 'Lora-Italic.ttf'), 'LoraItalic')

const W = 1500
const H = 500

const canvas = createCanvas(W, H)
const ctx = canvas.getContext('2d')

// ─── Color palette: Reverent Geometry ─────────────────────────────────────
const DEEP_CHARCOAL = '#1a1a1e'
const WARM_SLATE = '#2d2a2e'
const RICH_AMBER = '#c4903d'
const BURNT_GOLD = '#a87832'
const SOFT_GOLD = '#d4a853'
const IVORY = '#f5f0e8'
const WARM_CREAM = '#ede5d8'
const MUTED_BRONZE = '#8a6d3b'
const DEEP_EARTH = '#3d3428'

// ─── Background: deep charcoal with subtle warm gradient ──────────────────
const bgGrad = ctx.createLinearGradient(0, 0, W, H)
bgGrad.addColorStop(0, DEEP_CHARCOAL)
bgGrad.addColorStop(0.4, '#1e1b20')
bgGrad.addColorStop(0.7, WARM_SLATE)
bgGrad.addColorStop(1, DEEP_EARTH)
ctx.fillStyle = bgGrad
ctx.fillRect(0, 0, W, H)

// ─── Subtle noise texture (stipple pattern) ───────────────────────────────
for (let i = 0; i < 8000; i++) {
  const x = Math.random() * W
  const y = Math.random() * H
  const alpha = Math.random() * 0.04
  ctx.fillStyle = `rgba(244, 240, 232, ${alpha})`
  ctx.fillRect(x, y, 1, 1)
}

// ─── Geometric pattern band (left side) — Adinkra-inspired grid ──────────
function drawAdinkraCircle(cx, cy, r, color, alpha = 0.6) {
  ctx.strokeStyle = color
  ctx.globalAlpha = alpha
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.stroke()
  ctx.globalAlpha = 1
}

function drawDiamondMark(cx, cy, size, color, alpha = 0.5) {
  ctx.fillStyle = color
  ctx.globalAlpha = alpha
  ctx.beginPath()
  ctx.moveTo(cx, cy - size)
  ctx.lineTo(cx + size, cy)
  ctx.lineTo(cx, cy + size)
  ctx.lineTo(cx - size, cy)
  ctx.closePath()
  ctx.fill()
  ctx.globalAlpha = 1
}

function drawCrossMark(cx, cy, size, color, alpha = 0.4) {
  ctx.strokeStyle = color
  ctx.globalAlpha = alpha
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(cx - size, cy)
  ctx.lineTo(cx + size, cy)
  ctx.moveTo(cx, cy - size)
  ctx.lineTo(cx, cy + size)
  ctx.stroke()
  ctx.globalAlpha = 1
}

// Left geometric field — systematic grid of marks
const gridStartX = 40
const gridEndX = 460
const gridStartY = 50
const gridEndY = 450
const cellSize = 38

for (let x = gridStartX; x < gridEndX; x += cellSize) {
  for (let y = gridStartY; y < gridEndY; y += cellSize) {
    const col = Math.floor((x - gridStartX) / cellSize)
    const row = Math.floor((y - gridStartY) / cellSize)
    const pattern = (col + row) % 4

    if (pattern === 0) {
      drawAdinkraCircle(x + cellSize / 2, y + cellSize / 2, 10, RICH_AMBER, 0.35)
      drawAdinkraCircle(x + cellSize / 2, y + cellSize / 2, 5, SOFT_GOLD, 0.25)
    } else if (pattern === 1) {
      drawDiamondMark(x + cellSize / 2, y + cellSize / 2, 6, BURNT_GOLD, 0.2)
    } else if (pattern === 2) {
      drawCrossMark(x + cellSize / 2, y + cellSize / 2, 7, MUTED_BRONZE, 0.2)
    } else {
      // Small dot
      ctx.fillStyle = SOFT_GOLD
      ctx.globalAlpha = 0.15
      ctx.beginPath()
      ctx.arc(x + cellSize / 2, y + cellSize / 2, 2.5, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1
    }
  }
}

// ─── Vertical accent lines (left separator) ──────────────────────────────
ctx.strokeStyle = RICH_AMBER
ctx.globalAlpha = 0.4
ctx.lineWidth = 1
ctx.beginPath()
ctx.moveTo(490, 60)
ctx.lineTo(490, 440)
ctx.stroke()

ctx.globalAlpha = 0.2
ctx.beginPath()
ctx.moveTo(495, 80)
ctx.lineTo(495, 420)
ctx.stroke()
ctx.globalAlpha = 1

// ─── Right side: floating geometric constellation ────────────────────────

// Large decorative circles (right area)
function drawConcentricRings(cx, cy, maxR, rings, color) {
  for (let i = 0; i < rings; i++) {
    const r = maxR - i * (maxR / rings)
    const alpha = 0.08 + i * 0.04
    ctx.strokeStyle = color
    ctx.globalAlpha = alpha
    ctx.lineWidth = 0.8
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.stroke()
  }
  ctx.globalAlpha = 1
}

drawConcentricRings(1320, 120, 80, 6, SOFT_GOLD)
drawConcentricRings(1420, 380, 60, 5, RICH_AMBER)
drawConcentricRings(1180, 400, 45, 4, MUTED_BRONZE)

// Scattered small marks (right field)
const rightMarks = [
  [1100, 90], [1150, 140], [1200, 70], [1250, 160],
  [1300, 300], [1350, 250], [1400, 200], [1450, 280],
  [1100, 350], [1150, 420], [1250, 380], [1350, 440],
  [1050, 200], [1080, 280], [1130, 320],
]

rightMarks.forEach(([x, y], i) => {
  if (i % 3 === 0) {
    drawAdinkraCircle(x, y, 4, SOFT_GOLD, 0.25)
  } else if (i % 3 === 1) {
    drawDiamondMark(x, y, 3, RICH_AMBER, 0.2)
  } else {
    ctx.fillStyle = BURNT_GOLD
    ctx.globalAlpha = 0.18
    ctx.beginPath()
    ctx.arc(x, y, 2, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1
  }
})

// ─── Horizontal gold accent line across the middle ────────────────────────
const lineY = 248
const lineGrad = ctx.createLinearGradient(520, lineY, 1050, lineY)
lineGrad.addColorStop(0, 'rgba(196, 144, 61, 0)')
lineGrad.addColorStop(0.15, 'rgba(196, 144, 61, 0.5)')
lineGrad.addColorStop(0.85, 'rgba(196, 144, 61, 0.5)')
lineGrad.addColorStop(1, 'rgba(196, 144, 61, 0)')
ctx.strokeStyle = lineGrad
ctx.lineWidth = 0.8
ctx.beginPath()
ctx.moveTo(520, lineY)
ctx.lineTo(1050, lineY)
ctx.stroke()

// ─── Main typography: "FuneralPress" ─────────────────────────────────────

// Brand name
ctx.fillStyle = IVORY
ctx.font = '62px Italiana'
ctx.textAlign = 'left'
ctx.textBaseline = 'alphabetic'

const brandText = 'FuneralPress'
const brandX = 535
const brandY = 235

ctx.fillText(brandText, brandX, brandY)

// Subtle gold underline beneath brand
ctx.strokeStyle = RICH_AMBER
ctx.globalAlpha = 0.6
ctx.lineWidth = 1.2
ctx.beginPath()
ctx.moveTo(brandX, brandY + 10)
ctx.lineTo(brandX + ctx.measureText(brandText).width, brandY + 10)
ctx.stroke()
ctx.globalAlpha = 1

// ─── Tagline ─────────────────────────────────────────────────────────────
ctx.fillStyle = WARM_CREAM
ctx.globalAlpha = 0.7
ctx.font = '17px Lora'
ctx.fillText('Honouring lives with dignity', brandX, brandY + 42)
ctx.globalAlpha = 1

// ─── Descriptor line ─────────────────────────────────────────────────────
ctx.fillStyle = MUTED_BRONZE
ctx.globalAlpha = 0.6
ctx.font = '12px WorkSans'
ctx.letterSpacing = '3px'
const descText = 'BROCHURES  ·  MEMORIALS  ·  PROGRAMMES  ·  INVITATIONS'
ctx.fillText(descText, brandX, brandY + 75)
ctx.globalAlpha = 1

// ─── Small accent: location marker ───────────────────────────────────────
ctx.fillStyle = SOFT_GOLD
ctx.globalAlpha = 0.45
ctx.font = '11px WorkSans'
ctx.fillText('ACCRA, GHANA', brandX, brandY + 105)
ctx.globalAlpha = 1

// ─── Top-right: minimal website reference ────────────────────────────────
ctx.fillStyle = WARM_CREAM
ctx.globalAlpha = 0.35
ctx.font = '11px WorkSans'
ctx.textAlign = 'right'
ctx.fillText('funeralpress.org', W - 50, 40)
ctx.textAlign = 'left'
ctx.globalAlpha = 1

// ─── Bottom edge: thin gold border line ──────────────────────────────────
const bottomGrad = ctx.createLinearGradient(0, H - 3, W, H - 3)
bottomGrad.addColorStop(0, 'rgba(196, 144, 61, 0)')
bottomGrad.addColorStop(0.2, 'rgba(196, 144, 61, 0.5)')
bottomGrad.addColorStop(0.8, 'rgba(196, 144, 61, 0.5)')
bottomGrad.addColorStop(1, 'rgba(196, 144, 61, 0)')
ctx.strokeStyle = bottomGrad
ctx.lineWidth = 2
ctx.beginPath()
ctx.moveTo(0, H - 2)
ctx.lineTo(W, H - 2)
ctx.stroke()

// Top edge: matching thin gold line
const topGrad = ctx.createLinearGradient(0, 2, W, 2)
topGrad.addColorStop(0, 'rgba(196, 144, 61, 0)')
topGrad.addColorStop(0.2, 'rgba(196, 144, 61, 0.3)')
topGrad.addColorStop(0.8, 'rgba(196, 144, 61, 0.3)')
topGrad.addColorStop(1, 'rgba(196, 144, 61, 0)')
ctx.strokeStyle = topGrad
ctx.lineWidth = 1
ctx.beginPath()
ctx.moveTo(0, 1)
ctx.lineTo(W, 1)
ctx.stroke()

// ─── Subtle Adinkra symbol: Sankofa (stylized) in bottom-left ────────────
// A simplified heart/bird form representing "go back and get it" — learning from the past
function drawSankofa(cx, cy, scale, color, alpha) {
  ctx.strokeStyle = color
  ctx.globalAlpha = alpha
  ctx.lineWidth = 1.5 * scale

  // Stylized spiral heart
  ctx.beginPath()
  ctx.arc(cx, cy, 12 * scale, Math.PI * 0.3, Math.PI * 1.7)
  ctx.stroke()

  // Inner spiral
  ctx.beginPath()
  ctx.arc(cx + 4 * scale, cy - 2 * scale, 6 * scale, Math.PI * 0.5, Math.PI * 2)
  ctx.stroke()

  // Small accent dot
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(cx + 8 * scale, cy - 6 * scale, 2 * scale, 0, Math.PI * 2)
  ctx.fill()

  ctx.globalAlpha = 1
}

drawSankofa(70, H - 45, 1.2, RICH_AMBER, 0.25)

// ─── Final refinement pass: vignette overlay ─────────────────────────────
// Darken edges for depth
const vignetteLeft = ctx.createLinearGradient(0, 0, 120, 0)
vignetteLeft.addColorStop(0, 'rgba(18, 18, 20, 0.4)')
vignetteLeft.addColorStop(1, 'rgba(18, 18, 20, 0)')
ctx.fillStyle = vignetteLeft
ctx.fillRect(0, 0, 120, H)

const vignetteRight = ctx.createLinearGradient(W - 100, 0, W, 0)
vignetteRight.addColorStop(0, 'rgba(18, 18, 20, 0)')
vignetteRight.addColorStop(1, 'rgba(18, 18, 20, 0.4)')
ctx.fillStyle = vignetteRight
ctx.fillRect(W - 100, 0, 100, H)

// ─── Export ──────────────────────────────────────────────────────────────
const outputPath = join(__dirname, '..', 'public', 'x-cover.png')
const buffer = canvas.toBuffer('image/png')
writeFileSync(outputPath, buffer)
console.log(`Cover image saved to: ${outputPath}`)
console.log(`Dimensions: ${W}x${H}px`)
