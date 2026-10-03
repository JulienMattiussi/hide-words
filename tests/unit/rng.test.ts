import { describe, expect, it } from 'vitest'
import { createRng } from '@/lib/rng'

function take(rng: () => number, count: number): number[] {
  return Array.from({ length: count }, () => rng())
}

describe('createRng', () => {
  it('replays the same sequence for the same seed', () => {
    expect(take(createRng(42), 5)).toEqual(take(createRng(42), 5))
  })

  it('produces different sequences for different seeds', () => {
    expect(take(createRng(1), 5)).not.toEqual(take(createRng(2), 5))
  })

  it('stays within [0, 1)', () => {
    for (const value of take(createRng(7), 1000)) {
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })
})
