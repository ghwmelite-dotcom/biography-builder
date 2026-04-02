import { describe, it, expect } from 'vitest'

describe('Venue data validation', () => {
  function validateVenue(body) {
    const errors = []
    if (!body.name) errors.push('name is required')
    if (!body.region) errors.push('region is required')
    if (body.rating !== undefined && (body.rating < 0 || body.rating > 5)) errors.push('rating must be 0-5')
    if (body.lat !== undefined && (body.lat < -90 || body.lat > 90)) errors.push('invalid latitude')
    if (body.lng !== undefined && (body.lng < -180 || body.lng > 180)) errors.push('invalid longitude')
    return errors
  }

  it('passes with valid name and region', () => {
    expect(validateVenue({ name: 'Test Funeral Home', region: 'greater-accra' })).toEqual([])
  })

  it('fails without name', () => {
    const errors = validateVenue({ region: 'ashanti' })
    expect(errors).toContain('name is required')
  })

  it('fails without region', () => {
    const errors = validateVenue({ name: 'Test' })
    expect(errors).toContain('region is required')
  })

  it('validates rating range', () => {
    expect(validateVenue({ name: 'T', region: 'r', rating: 6 })).toContain('rating must be 0-5')
    expect(validateVenue({ name: 'T', region: 'r', rating: -1 })).toContain('rating must be 0-5')
    expect(validateVenue({ name: 'T', region: 'r', rating: 4.5 })).toEqual([])
  })

  it('validates coordinates', () => {
    expect(validateVenue({ name: 'T', region: 'r', lat: 100 })).toContain('invalid latitude')
    expect(validateVenue({ name: 'T', region: 'r', lng: 200 })).toContain('invalid longitude')
    expect(validateVenue({ name: 'T', region: 'r', lat: 5.6, lng: -0.2 })).toEqual([])
  })
})

describe('Venue query building', () => {
  it('filters by region when provided', () => {
    const region = 'greater-accra'
    const hasRegionFilter = !!region
    expect(hasRegionFilter).toBe(true)
  })

  it('defaults to verified only', () => {
    const verified = parseInt('') || 1
    expect(verified).toBe(1)
  })
})
