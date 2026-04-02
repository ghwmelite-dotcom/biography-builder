import { describe, it, expect } from 'vitest'

describe('Analytics percentage change', () => {
  function pctChange(current, previous) {
    if (!previous) return current > 0 ? 100 : 0
    return Math.round(((current - previous) / previous) * 100)
  }

  it('calculates positive change', () => {
    expect(pctChange(150, 100)).toBe(50)
  })

  it('calculates negative change', () => {
    expect(pctChange(80, 100)).toBe(-20)
  })

  it('handles zero previous (with current)', () => {
    expect(pctChange(10, 0)).toBe(100)
  })

  it('handles zero both', () => {
    expect(pctChange(0, 0)).toBe(0)
  })

  it('handles equal values', () => {
    expect(pctChange(100, 100)).toBe(0)
  })
})

describe('Analytics query parameter validation', () => {
  it('days defaults to 30', () => {
    const days = parseInt('') || 30
    expect(days).toBe(30)
  })

  it('limit caps at 20', () => {
    const limit = Math.min(20, parseInt('50') || 10)
    expect(limit).toBe(20)
  })

  it('limit defaults to 10', () => {
    const limit = Math.min(20, parseInt('') || 10)
    expect(limit).toBe(10)
  })
})
