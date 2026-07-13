import { describe, expect, it } from 'vitest'
import { buildGrid, noiseAlphabet } from '@/lib/grid'
import { textToPattern } from '@/lib/pattern'

function countOn(pattern: boolean[][]): number {
  return pattern.reduce((sum, row) => sum + row.filter(Boolean).length, 0)
}

const isUpper = (char: string) => char >= 'A' && char <= 'Z'
const isLower = (char: string) => char >= 'a' && char <= 'z'

describe('buildGrid', () => {
  it('produces a landscape grid wider than tall', () => {
    const grid = buildGrid({ orientation: 'landscape', text: 'HI\nYO' })
    expect(grid.cols).toBeGreaterThanOrEqual(grid.rows)
    expect(grid.cells).toHaveLength(grid.cols * grid.rows)
  })

  it('produces a portrait grid taller than wide', () => {
    const grid = buildGrid({ orientation: 'portrait', text: 'HI\nYO' })
    expect(grid.rows).toBeGreaterThanOrEqual(grid.cols)
  })

  it('keeps the whole trace inside the grid with a noise margin', () => {
    const grid = buildGrid({ orientation: 'landscape', text: 'HELLO\nWORLD' })
    const onCount = grid.cells.filter((cell) => cell.on).length
    expect(onCount).toBe(countOn(textToPattern('HELLO\nWORLD')))
  })

  it('is deterministic for a given seed', () => {
    const options = { orientation: 'landscape' as const, text: 'HI\nYO', seed: 7 }
    expect(buildGrid(options)).toEqual(buildGrid(options))
  })

  it('fills the trace with the given letters, cycling them', () => {
    const grid = buildGrid({ orientation: 'landscape', text: 'HI', fillLetters: 'XY' })
    const traceChars = grid.cells.filter((cell) => cell.on).map((cell) => cell.char)
    expect(new Set(traceChars)).toEqual(new Set(['X', 'Y']))
  })

  it('falls back to the text letters when fill is empty', () => {
    const grid = buildGrid({ orientation: 'landscape', text: 'HI', fillLetters: '' })
    const traceChars = grid.cells.filter((cell) => cell.on).map((cell) => cell.char)
    expect(new Set(traceChars)).toEqual(new Set(['H', 'I']))
  })

  it('has no trace cells when the text is blank', () => {
    const grid = buildGrid({ orientation: 'landscape', text: '' })
    expect(grid.cells.some((cell) => cell.on)).toBe(false)
  })

  it('never puts a trace letter into the noise', () => {
    const grid = buildGrid({ orientation: 'landscape', text: 'HELLO\nWORLD', fillLetters: 'CODÉ' })
    const traceLetters = new Set([...'CODÉ'])
    const noiseChars = grid.cells.filter((cell) => !cell.on).map((cell) => cell.char)
    expect(noiseChars.some((char) => traceLetters.has(char))).toBe(false)
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
