import { describe, expect, it } from 'vitest'
import { autoKeys, regionLetters, validateKeys } from '@/lib/keys'

describe('regionLetters', () => {
  it('returns letters exclusive to a region', () => {
    expect(new Set(regionLetters(['ABC', 'CDE'], 0b01))).toEqual(new Set(['A', 'B']))
    expect(new Set(regionLetters(['ABC', 'CDE'], 0b10))).toEqual(new Set(['D', 'E']))
    expect(regionLetters(['ABC', 'CDE'], 0b11)).toEqual(['C'])
  })
})

describe('validateKeys', () => {
  it('accepts keys that cover every region', () => {
    expect(validateKeys(['ABC', 'CDE'], [0b01, 0b10, 0b11]).valid).toBe(true)
  })

  it('rejects keys leaving a region without an exclusive letter', () => {
    expect(validateKeys(['AB', 'AB'], [0b01, 0b10, 0b11]).valid).toBe(false)
  })
})

describe('autoKeys', () => {
  it('generates keys covering every occupied region', () => {
    const regions = [0b01, 0b10, 0b11]
    const keys = autoKeys(2, regions, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')
    expect(validateKeys(keys, regions).valid).toBe(true)
    const shared = regionLetters(keys, 0b11)
    expect(shared.length).toBeGreaterThanOrEqual(1)
    for (const char of shared) {
      expect(keys[0]).toContain(char)
      expect(keys[1]).toContain(char)
    }
  })

  it('supports three interlaced codes', () => {
    const regions = [0b001, 0b010, 0b100, 0b011, 0b101, 0b110, 0b111]
    const keys = autoKeys(3, regions, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')
    expect(validateKeys(keys, regions).valid).toBe(true)
  })
})
