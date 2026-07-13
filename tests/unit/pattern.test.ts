import { describe, expect, it } from 'vitest'
import { GLYPH_HEIGHT, GLYPH_WIDTH, getGlyph } from '@/lib/font'
import { textToPattern, wordToPattern } from '@/lib/pattern'

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

describe('textToPattern', () => {
  it('returns an empty pattern for blank text', () => {
    expect(textToPattern('')).toEqual([])
    expect(textToPattern('\n  \n')).toEqual([])
  })

  it('stacks lines vertically, keeping a common width', () => {
    const single = textToPattern('HI')
    const doubled = textToPattern('HI\nHI')
    expect(doubled.length).toBeGreaterThan(single.length)
    expect(doubled[0]).toHaveLength(single[0]?.length ?? 0)
  })

  it('widens to the longest line', () => {
    const pattern = textToPattern('A\nABC')
    const longWidth = wordToPattern('ABC')[0]?.length ?? 0
    expect(pattern[0]).toHaveLength(longWidth)
  })
})
