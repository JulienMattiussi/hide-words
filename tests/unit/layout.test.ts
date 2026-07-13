import { describe, expect, it } from 'vitest'
import { bestOffset, overlapAt, placeMasks } from '@/lib/layout'
import { textToPattern } from '@/lib/pattern'

function countOn(mask: boolean[][]): number {
  return mask.reduce((sum, row) => sum + row.filter(Boolean).length, 0)
}

describe('overlapAt', () => {
  it('counts coincident cells when fully aligned', () => {
    const pattern = textToPattern('HI')
    expect(overlapAt(pattern, pattern, 0, 0)).toBe(countOn(pattern))
  })

  it('reports no overlap when shifted far apart', () => {
    const pattern = textToPattern('HI')
    const width = pattern[0]?.length ?? 0
    expect(overlapAt(pattern, pattern, width + 5, 0)).toBe(0)
  })
})

describe('placeMasks', () => {
  it('paints both patterns inside a shared canvas', () => {
    const a = textToPattern('HI')
    const b = textToPattern('YO')
    const placement = placeMasks(a, b, 2, 1)
    expect(placement.primary).toHaveLength(placement.rows)
    expect(placement.secondary).toHaveLength(placement.rows)
    expect(countOn(placement.primary)).toBe(countOn(a))
    expect(countOn(placement.secondary)).toBe(countOn(b))
  })

  it('handles a missing second pattern', () => {
    const a = textToPattern('HI')
    const placement = placeMasks(a, [], 0, 0)
    expect(countOn(placement.secondary)).toBe(0)
    expect(countOn(placement.primary)).toBe(countOn(a))
  })
})

describe('bestOffset', () => {
  it('minimises overlap relative to the centred position', () => {
    const a = textToPattern('HELLO')
    const b = textToPattern('WORLD')
    const offset = bestOffset(a, b)
    const centerX = Math.round(((a[0]?.length ?? 0) - (b[0]?.length ?? 0)) / 2)
    const centerY = Math.round((a.length - b.length) / 2)
    expect(overlapAt(a, b, offset.dx, offset.dy)).toBeLessThanOrEqual(
      overlapAt(a, b, centerX, centerY),
    )
  })
})
