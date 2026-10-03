import { describe, expect, it } from 'vitest'
import { autoOffsets, composeMasks } from '@/lib/layout'
import { textToPattern } from '@/lib/pattern'

function countOn(mask: boolean[][]): number {
  return mask.reduce((sum, row) => sum + row.filter(Boolean).length, 0)
}

function countShared(a: boolean[][], b: boolean[][]): number {
  return a.reduce((sum, row, y) => sum + row.filter((on, x) => on && b[y]?.[x]).length, 0)
}

describe('autoOffsets', () => {
  it('returns one offset per pattern, the first at the origin', () => {
    const offsets = autoOffsets([textToPattern('HELLO'), textToPattern('WORLD')])
    expect(offsets).toHaveLength(2)
    expect(offsets[0]).toEqual({ dx: 0, dy: 0 })
  })

  it('shifts identical patterns so they cross without fully overlapping', () => {
    const pattern = textToPattern('HI')
    const offsets = autoOffsets([pattern, pattern])
    const { masks } = composeMasks([pattern, pattern], offsets)
    const shared = countShared(masks[0] ?? [], masks[1] ?? [])
    expect(shared).toBeGreaterThanOrEqual(1)
    expect(shared).toBeLessThan(countOn(pattern))
  })

  it('keeps an origin offset for empty patterns', () => {
    expect(autoOffsets([textToPattern('HI'), []])[1]).toEqual({ dx: 0, dy: 0 })
  })
})

describe('composeMasks', () => {
  it('paints every pattern into a shared canvas', () => {
    const a = textToPattern('HI')
    const b = textToPattern('YO')
    const { cols, rows, masks } = composeMasks(
      [a, b],
      [
        { dx: 0, dy: 0 },
        { dx: 2, dy: 1 },
      ],
    )
    expect(masks).toHaveLength(2)
    expect(masks[0]).toHaveLength(rows)
    expect(masks[0]?.[0]).toHaveLength(cols)
    expect(countOn(masks[0] ?? [])).toBe(countOn(a))
    expect(countOn(masks[1] ?? [])).toBe(countOn(b))
  })

  it('ignores empty patterns', () => {
    const a = textToPattern('HI')
    const { masks } = composeMasks(
      [a, []],
      [
        { dx: 0, dy: 0 },
        { dx: 0, dy: 0 },
      ],
    )
    expect(countOn(masks[1] ?? [])).toBe(0)
  })
})
