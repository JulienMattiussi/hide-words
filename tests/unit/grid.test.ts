import { describe, expect, it } from 'vitest'
import { buildGrid, noiseAlphabet } from '@/lib/grid'
import { textToPattern } from '@/lib/pattern'

function countOn(pattern: boolean[][]): number {
  return pattern.reduce((sum, row) => sum + row.filter(Boolean).length, 0)
}

const isUpper = (char: string) => char >= 'A' && char <= 'Z'
const isLower = (char: string) => char >= 'a' && char <= 'z'

describe('buildGrid, single code', () => {
  it('renders only the first code when there is no second', () => {
    const grid = buildGrid({ orientation: 'landscape', first: { text: 'HELLO' } })
    expect(grid.secondActive).toBe(false)
    expect(grid.cells.some((cell) => cell.secondary)).toBe(false)
    const primaryCount = grid.cells.filter((cell) => cell.primary).length
    expect(primaryCount).toBe(countOn(textToPattern('HELLO')))
  })

  it('produces a landscape grid wider than tall', () => {
    const grid = buildGrid({ orientation: 'landscape', first: { text: 'HELLO' } })
    expect(grid.cols).toBeGreaterThanOrEqual(grid.rows)
  })
})

describe('buildGrid, two codes', () => {
  const options = {
    orientation: 'landscape' as const,
    first: { text: 'JOUR', key: 'JOURNE' },
    second: { text: 'NUIT', key: 'NEBCT' },
  }

  it('activates the second code for a valid combination', () => {
    const grid = buildGrid(options)
    expect(grid.secondActive).toBe(true)
    expect(new Set(grid.keys.shared)).toEqual(new Set(['N', 'E']))
    expect(grid.cells.some((cell) => cell.primary)).toBe(true)
    expect(grid.cells.some((cell) => cell.secondary)).toBe(true)
  })

  it('keeps the two reveals independent through letter placement', () => {
    const grid = buildGrid(options)
    const key1 = new Set([...'JOURNE'])
    const key2 = new Set([...'NEBCT'])
    for (const cell of grid.cells) {
      if (cell.primary && cell.secondary) {
        expect(['N', 'E']).toContain(cell.char)
      } else if (cell.primary) {
        expect(key1.has(cell.char)).toBe(true)
        expect(key2.has(cell.char)).toBe(false)
      } else if (cell.secondary) {
        expect(key2.has(cell.char)).toBe(true)
        expect(key1.has(cell.char)).toBe(false)
      } else {
        expect(key1.has(cell.char)).toBe(false)
        expect(key2.has(cell.char)).toBe(false)
      }
    }
  })

  it('is deterministic for a given seed', () => {
    expect(buildGrid({ ...options, seed: 5 })).toEqual(buildGrid({ ...options, seed: 5 }))
  })

  it('honours a manual offset', () => {
    const grid = buildGrid({ ...options, offset: { dx: 3, dy: 2 } })
    expect(grid.offset).toEqual({ dx: 3, dy: 2 })
  })

  it('ignores the second code when the combination is invalid', () => {
    const grid = buildGrid({
      orientation: 'landscape',
      first: { text: 'JOUR', key: 'ABC' },
      second: { text: 'NUIT', key: 'CDE' },
    })
    expect(grid.secondActive).toBe(false)
    expect(grid.cells.some((cell) => cell.secondary)).toBe(false)
  })
})

describe('noiseAlphabet', () => {
  it('uses only uppercase when the trace is uppercase', () => {
    const pool = [...noiseAlphabet('CODE')]
    expect(pool.every(isUpper)).toBe(true)
    expect(pool).not.toContain('C')
  })

  it('uses only lowercase when the trace is lowercase', () => {
    const pool = [...noiseAlphabet('code')]
    expect(pool.every(isLower)).toBe(true)
    expect(pool).not.toContain('c')
  })

  it('adds accented letters when the trace has accents', () => {
    const pool = noiseAlphabet('CAFÉ')
    expect(pool).toContain('È')
    expect([...pool]).not.toContain('É')
    expect([...pool].some(isLower)).toBe(false)
  })

  it('mixes cases when the trace mixes cases', () => {
    const pool = [...noiseAlphabet('Code')]
    expect(pool.some(isUpper)).toBe(true)
    expect(pool.some(isLower)).toBe(true)
  })

  it('excludes every trace letter from the pool', () => {
    const source = 'AbÇé9'
    const pool = new Set([...noiseAlphabet(source)])
    for (const char of source) {
      expect(pool.has(char)).toBe(false)
    }
  })
})
