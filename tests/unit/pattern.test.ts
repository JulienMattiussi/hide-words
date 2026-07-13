import { describe, expect, it } from 'vitest'
import { GLYPH_HEIGHT, GLYPH_WIDTH, getGlyph } from '@/lib/font'
import { wordToPattern } from '@/lib/pattern'

describe('wordToPattern', () => {
  it('returns an empty pattern for an empty word', () => {
    expect(wordToPattern('')).toEqual([])
  })

  it('matches a single glyph', () => {
    expect(wordToPattern('A')).toEqual(getGlyph('A'))
  })

  it('concatenates glyphs with a blank spacing column', () => {
    const pattern = wordToPattern('AB', 1)
    expect(pattern).toHaveLength(GLYPH_HEIGHT)
    const width = 2 * GLYPH_WIDTH + 1
    for (const row of pattern) {
      expect(row).toHaveLength(width)
      expect(row[GLYPH_WIDTH]).toBe(false)
    }
  })
})
