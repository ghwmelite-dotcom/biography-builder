import { describe, it, expect } from 'vitest'

describe('watermark logic', () => {
  function shouldApplyWatermark(isUnlocked, hasSubscription, isUnlimited) {
    if (isUnlocked) return false
    if (hasSubscription) return false
    if (isUnlimited) return false
    return true
  }

  it('no watermark for unlocked designs', () => {
    expect(shouldApplyWatermark(true, false, false)).toBe(false)
  })

  it('no watermark for subscribers', () => {
    expect(shouldApplyWatermark(false, true, false)).toBe(false)
  })

  it('no watermark for unlimited suite', () => {
    expect(shouldApplyWatermark(false, false, true)).toBe(false)
  })

  it('watermark for free tier', () => {
    expect(shouldApplyWatermark(false, false, false)).toBe(true)
  })

  it('no watermark when unlocked even without subscription', () => {
    expect(shouldApplyWatermark(true, false, false)).toBe(false)
  })
})
