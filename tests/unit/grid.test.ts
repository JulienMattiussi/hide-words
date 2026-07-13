import { describe, expect, it } from 'vitest'
import { buildGrid } from '@/lib/grid'
import { wordToPattern } from '@/lib/pattern'

function countOn(pattern: boolean[][]): number {
  return pattern.reduce((sum, row) => sum + row.filter(Boolean).length, 0)
}

describe('buildGrid', () => {
  it('produces cols x rows cells', () => {
    const grid = buildGrid({ cols: 20, rows: 12, word: 'HI' })
    expect(grid.cols).toBe(20)
    expect(grid.rows).toBe(12)
    expect(grid.cells).toHaveLength(240)
  })

  it('is deterministic for a given seed', () => {
    const options = { cols: 20, rows: 12, word: 'HI', seed: 7 }
    expect(buildGrid(options)).toEqual(buildGrid(options))
  })

  it('marks exactly the pattern cells as on', () => {
    const grid = buildGrid({ cols: 40, rows: 12, word: 'HI' })
    const onCount = grid.cells.filter((cell) => cell.on).length
    expect(onCount).toBe(countOn(wordToPattern('HI')))
  })

  it('fills the trace with the given letters, cycling them', () => {
    const grid = buildGrid({ cols: 40, rows: 12, word: 'HI', fillLetters: 'XY' })
    const traceChars = grid.cells.filter((cell) => cell.on).map((cell) => cell.char)
    expect(new Set(traceChars)).toEqual(new Set(['X', 'Y']))
  })

  it('falls back to the word letters when fill is empty', () => {
    const grid = buildGrid({ cols: 40, rows: 12, word: 'HI', fillLetters: '' })
    const traceChars = grid.cells.filter((cell) => cell.on).map((cell) => cell.char)
    expect(new Set(traceChars)).toEqual(new Set(['H', 'I']))
  })

  it('has no trace cells when the word is empty', () => {
    const grid = buildGrid({ cols: 20, rows: 12, word: '' })
    expect(grid.cells.some((cell) => cell.on)).toBe(false)
  })
})
