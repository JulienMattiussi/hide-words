import { describe, expect, it } from 'vitest'
import { GLYPH_HEIGHT, GLYPH_WIDTH, getGlyph } from '@/lib/font'

function countOn(glyph: boolean[][]): number {
  return glyph.reduce((sum, row) => sum + row.filter(Boolean).length, 0)
}

describe('getGlyph', () => {
  it('returns a fixed-size matrix', () => {
    const glyph = getGlyph('A')
    expect(glyph).toHaveLength(GLYPH_HEIGHT)
    for (const row of glyph) {
      expect(row).toHaveLength(GLYPH_WIDTH)
    }
  })

  it('reserves the two top rows for diacritics on a plain letter', () => {
    const glyph = getGlyph('A')
    expect(glyph[0]).toEqual([false, false, false, false, false])
    expect(glyph[1]).toEqual([false, false, false, false, false])
    expect(glyph[2]).toEqual([false, true, true, true, false])
  })

  it('adds a diacritic mark above the base letter for accents', () => {
    const plain = getGlyph('e')
    const accented = getGlyph('é')
    expect(countOn(accented)).toBeGreaterThan(countOn(plain))
    expect(accented.slice(2)).toEqual(plain.slice(2))
  })

  it('supports digits and lowercase', () => {
    expect(countOn(getGlyph('5'))).toBeGreaterThan(0)
    expect(countOn(getGlyph('a'))).toBeGreaterThan(0)
  })

  it('returns an empty matrix for unknown characters', () => {
    expect(countOn(getGlyph('#'))).toBe(0)
  })
})
