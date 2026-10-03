import { describe, expect, it } from 'vitest'
import { bitsOf, popcount } from '@/lib/bits'

describe('bitsOf', () => {
  it('lists the set bit indexes within the given width', () => {
    expect(bitsOf(0b101, 3)).toEqual([0, 2])
    expect(bitsOf(0b101, 2)).toEqual([0])
    expect(bitsOf(0, 3)).toEqual([])
  })
})

describe('popcount', () => {
  it('counts the set bits', () => {
    expect(popcount(0)).toBe(0)
    expect(popcount(0b1011)).toBe(3)
  })
})
