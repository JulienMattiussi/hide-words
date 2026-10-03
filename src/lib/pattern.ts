import { GLYPH_HEIGHT, GLYPH_WIDTH, getGlyph } from '@/lib/font'
import { normalizeTextLines } from '@/lib/text'

const LETTER_SPACING = 1
const LINE_SPACING = 1

export function wordToPattern(word: string): boolean[][] {
  const chars = [...word]
  if (chars.length === 0) return []
  const glyphs = chars.map((char) => getGlyph(char))
  const width = chars.length * GLYPH_WIDTH + (chars.length - 1) * LETTER_SPACING
  const pattern: boolean[][] = []
  for (let y = 0; y < GLYPH_HEIGHT; y++) {
    const row: boolean[] = new Array<boolean>(width).fill(false)
    let x = 0
    for (const glyph of glyphs) {
      const glyphRow = glyph[y] ?? []
      for (let gx = 0; gx < GLYPH_WIDTH; gx++) {
        row[x + gx] = glyphRow[gx] ?? false
      }
      x += GLYPH_WIDTH + LETTER_SPACING
    }
    pattern.push(row)
  }
  return pattern
}

export function textToPattern(text: string): boolean[][] {
  const lines = normalizeTextLines(text)
  const linePatterns = lines.map((line) => (line.length > 0 ? wordToPattern(line) : []))
  const width = linePatterns.reduce((max, pattern) => Math.max(max, pattern[0]?.length ?? 0), 0)
  if (width === 0) return []
  const result: boolean[][] = []
  linePatterns.forEach((pattern, index) => {
    if (index > 0) {
      for (let s = 0; s < LINE_SPACING; s++) {
        result.push(new Array<boolean>(width).fill(false))
      }
    }
    const lineWidth = pattern[0]?.length ?? 0
    const offset = Math.floor((width - lineWidth) / 2)
    const height = pattern.length > 0 ? pattern.length : GLYPH_HEIGHT
    for (let y = 0; y < height; y++) {
      const row = new Array<boolean>(width).fill(false)
      const sourceRow = pattern[y] ?? []
      for (let x = 0; x < sourceRow.length; x++) {
        row[offset + x] = sourceRow[x] ?? false
      }
      result.push(row)
    }
  })
  return result
}
