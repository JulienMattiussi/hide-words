import { GLYPH_HEIGHT, GLYPH_WIDTH, getGlyph } from '@/lib/font'

export function wordToPattern(word: string, spacing = 1): boolean[][] {
  const chars = [...word]
  if (chars.length === 0) return []
  const glyphs = chars.map((char) => getGlyph(char))
  const width = chars.length * GLYPH_WIDTH + (chars.length - 1) * spacing
  const pattern: boolean[][] = []
  for (let y = 0; y < GLYPH_HEIGHT; y++) {
    const row: boolean[] = new Array<boolean>(width).fill(false)
    let x = 0
    for (const glyph of glyphs) {
      const glyphRow = glyph[y] ?? []
      for (let gx = 0; gx < GLYPH_WIDTH; gx++) {
        row[x + gx] = glyphRow[gx] ?? false
      }
      x += GLYPH_WIDTH + spacing
    }
    pattern.push(row)
  }
  return pattern
}
