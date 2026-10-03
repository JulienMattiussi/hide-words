import { describe, expect, it } from 'vitest'
import { buildGrid, noiseAlphabet } from '@/lib/grid'
import { textToPattern } from '@/lib/pattern'

function countOn(pattern: boolean[][]): number {
  return pattern.reduce((sum, row) => sum + row.filter(Boolean).length, 0)
}

const isUpper = (char: string) => char >= 'A' && char <= 'Z'
const isLower = (char: string) => char >= 'a' && char <= 'z'

function expectRevealsIndependent(grid: ReturnType<typeof buildGrid>) {
  const keySets = grid.keys.map((key) => new Set([...key]))
  for (const cell of grid.cells) {
    for (let i = 0; i < grid.count; i++) {
      const set = keySets[i]
      if (!set) continue
      const inKey = set.has(cell.char)
      const onCode = (cell.mask & (1 << i)) !== 0
      expect(inKey).toBe(onCode)
    }
  }
}

describe('buildGrid, single code', () => {
  it('marks the pattern cells and excludes the key from the noise', () => {
    const grid = buildGrid({ orientation: 'landscape', codes: [{ text: 'HELLO' }] })
    expect(grid.count).toBe(1)
    const onCount = grid.cells.filter((cell) => cell.mask !== 0).length
    expect(onCount).toBe(countOn(textToPattern('HELLO')))
    expectRevealsIndependent(grid)
  })
})

describe('buildGrid, two codes', () => {
  const options = {
    orientation: 'landscape' as const,
    codes: [{ text: 'JOUR' }, { text: 'NUIT' }],
  }

  it('keeps the two reveals independent', () => {
    const grid = buildGrid(options)
    expect(grid.cells.some((cell) => cell.mask & 0b01)).toBe(true)
    expect(grid.cells.some((cell) => cell.mask & 0b10)).toBe(true)
    expectRevealsIndependent(grid)
  })

  it('is deterministic for a given seed', () => {
    expect(buildGrid({ ...options, seed: 5 })).toEqual(buildGrid({ ...options, seed: 5 }))
  })
})

describe('buildGrid, three codes', () => {
  it('keeps all three reveals independent', () => {
    const grid = buildGrid({
      orientation: 'landscape',
      codes: [{ text: 'JOUR' }, { text: 'NUIT' }, { text: 'SOIR' }],
    })
    expect(grid.count).toBe(3)
    for (let i = 0; i < 3; i++) {
      expect(grid.cells.some((cell) => cell.mask & (1 << i))).toBe(true)
    }
    expectRevealsIndependent(grid)
  })
})

describe('buildGrid, keys', () => {
  it('flags an invalid combination and falls back to generated keys', () => {
    const grid = buildGrid({
      orientation: 'landscape',
      codes: [
        { text: 'JOUR', key: 'AB' },
        { text: 'NUIT', key: 'AB' },
      ],
    })
    expect(grid.keyStatus.valid).toBe(false)
    expect(grid.suggested.length).toBe(2)
    expectRevealsIndependent(grid)
  })

  it('ships a valid default configuration', () => {
    const grid = buildGrid({
      orientation: 'landscape',
      codes: [
        { text: 'JOUR', key: 'bêtement' },
        { text: 'NUIT', key: 'trop fort' },
        { text: 'SOIR', key: 'les clefs' },
      ],
      offsets: [
        { dx: 0, dy: 0 },
        { dx: -6, dy: 1 },
        { dx: -5, dy: -1 },
      ],
    })
    expect(grid.keyStatus.valid).toBe(true)
    expectRevealsIndependent(grid)
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

  it('excludes every trace letter from the pool', () => {
    const source = 'AbÇé9'
    const pool = new Set([...noiseAlphabet(source)])
    for (const char of source) {
      expect(pool.has(char)).toBe(false)
    }
  })
})
