import { describe, it, expect } from 'vitest'
import { hashPin, verifyPin, isValidPinFormat } from '../utils/pinHash.js'

describe('isValidPinFormat', () => {
  it('accepts a 6-digit numeric PIN', () => {
    expect(isValidPinFormat('123456')).toBe(true)
    expect(isValidPinFormat('000000')).toBe(true)
    expect(isValidPinFormat('999999')).toBe(true)
  })

  it('rejects PINs that are too short or too long', () => {
    expect(isValidPinFormat('12345')).toBe(false)
    expect(isValidPinFormat('1234567')).toBe(false)
    expect(isValidPinFormat('')).toBe(false)
  })

  it('rejects non-numeric characters', () => {
    expect(isValidPinFormat('12345a')).toBe(false)
    expect(isValidPinFormat('abcdef')).toBe(false)
    expect(isValidPinFormat('1234 6')).toBe(false)
  })

  it('rejects null/undefined/non-string input', () => {
    expect(isValidPinFormat(null)).toBe(false)
    expect(isValidPinFormat(undefined)).toBe(false)
    expect(isValidPinFormat(123456)).toBe(false)
  })
})

describe('hashPin / verifyPin (PBKDF2-SHA256)', () => {
  it('round-trips: a hashed PIN verifies against itself', async () => {
    const hash = await hashPin('123456')
    expect(await verifyPin('123456', hash)).toBe(true)
  })

  it('rejects wrong PIN', async () => {
    const hash = await hashPin('123456')
    expect(await verifyPin('654321', hash)).toBe(false)
    expect(await verifyPin('000000', hash)).toBe(false)
  })

  it('produces format-versioned output: pbkdf2$<iter>$<salt>$<hash>', async () => {
    const hash = await hashPin('123456')
    expect(hash).toMatch(/^pbkdf2\$\d+\$[A-Za-z0-9+/=_-]+\$[A-Za-z0-9+/=_-]+$/)
    const parts = hash.split('$')
    expect(parts).toHaveLength(4)
    expect(parts[0]).toBe('pbkdf2')
    expect(Number(parts[1])).toBeGreaterThanOrEqual(100000) // sanity floor
  })

  it('uses a different salt every call (so two hashes of the same PIN differ)', async () => {
    const a = await hashPin('123456')
    const b = await hashPin('123456')
    expect(a).not.toBe(b)
    // both still verify
    expect(await verifyPin('123456', a)).toBe(true)
    expect(await verifyPin('123456', b)).toBe(true)
  })

  it('returns false rather than throwing on a malformed hash', async () => {
    expect(await verifyPin('123456', 'not-a-real-hash')).toBe(false)
    expect(await verifyPin('123456', '')).toBe(false)
    expect(await verifyPin('123456', null)).toBe(false)
    expect(await verifyPin('123456', 'pbkdf2$only$two')).toBe(false)
    expect(await verifyPin('123456', 'pbkdf2$abc$bad-iter$hash')).toBe(false)
  })

  it('returns false rather than throwing on a malformed PIN', async () => {
    const hash = await hashPin('123456')
    expect(await verifyPin('', hash)).toBe(false)
    expect(await verifyPin(null, hash)).toBe(false)
    expect(await verifyPin(undefined, hash)).toBe(false)
  })

  it('verifies a hash produced with a different (older) iteration count', async () => {
    // Round-trip with a hand-crafted hash that uses a low iteration count
    // (simulates a future iteration upgrade where old hashes still verify).
    const lowIter = await hashPin('111222', 50000)
    expect(await verifyPin('111222', lowIter)).toBe(true)
    expect(lowIter).toContain('pbkdf2$50000$')
  })
})
