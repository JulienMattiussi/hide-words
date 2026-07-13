import { normalizeLetters } from '@/lib/text'
import { textToPattern } from '@/lib/pattern'
import { createRng } from '@/lib/rng'

interface Cell {
  char: string
  on: boolean
}

export type Orientation = 'landscape' | 'portrait'

export interface Grid {
  cols: number
  rows: number
  cells: Cell[]
}

export interface GridOptions {
  orientation: Orientation
  text: string
  fillLetters?: string
  letterSpacing?: number
  lineSpacing?: number
  seed?: number
}

const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LOWER = 'abcdefghijklmnopqrstuvwxyz'
const UPPER_ACCENT = 'ÀÂÄÉÈÊËÎÏÔÖÙÛÜŸÇ'
const LOWER_ACCENT = 'àâäéèêëîïôöùûüÿç'
const DIGITS = '0123456789'
const MARGIN = 3
const ASPECT_RATIO = 1.4

export function noiseAlphabet(source: string): string {
  const used = new Set([...source])
  const has = (set: string) => [...set].some((char) => used.has(char))
  const upperPresent = has(UPPER) || has(UPPER_ACCENT)
  const lowerPresent = has(LOWER) || has(LOWER_ACCENT)
  const accentPresent = has(UPPER_ACCENT) || has(LOWER_ACCENT)
  const digitPresent = has(DIGITS)
  let pool = ''
  if (upperPresent) pool += UPPER + (accentPresent ? UPPER_ACCENT : '')
  if (lowerPresent) pool += LOWER + (accentPresent ? LOWER_ACCENT : '')
  if (digitPresent) pool += DIGITS
  const filtered = [...pool].filter((char) => !used.has(char)).join('')
  if (filtered.length > 0) return filtered
  if (pool.length > 0) return pool
  return UPPER
}

export function buildGrid(options: GridOptions): Grid {
  const fillSource =
    normalizeLetters(options.fillLetters ?? '') || normalizeLetters(options.text) || 'X'
  const pattern = textToPattern(options.text, options.letterSpacing ?? 1, options.lineSpacing ?? 1)
  const patternHeight = pattern.length
  const patternWidth = patternHeight > 0 ? (pattern[0]?.length ?? 0) : 0

  let cols = patternWidth + 2 * MARGIN
  let rows = patternHeight + 2 * MARGIN
  if (options.orientation === 'landscape') {
    cols = Math.max(cols, Math.round(rows * ASPECT_RATIO))
  } else {
    rows = Math.max(rows, Math.round(cols * ASPECT_RATIO))
  }

  const offsetX = Math.floor((cols - patternWidth) / 2)
  const offsetY = Math.floor((rows - patternHeight) / 2)
  const rng = createRng(options.seed ?? 1)
  const noise = noiseAlphabet(fillSource)
  const cells: Cell[] = []
  let fillIndex = 0
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const py = y - offsetY
      const px = x - offsetX
      const on =
        py >= 0 && py < patternHeight && px >= 0 && px < patternWidth
          ? (pattern[py]?.[px] ?? false)
          : false
      if (on) {
        const char = fillSource[fillIndex % fillSource.length] ?? 'X'
        fillIndex += 1
        cells.push({ char, on: true })
      } else {
        const char = noise[Math.floor(rng() * noise.length)] ?? 'X'
        cells.push({ char, on: false })
      }
    }
  }
  return { cols, rows, cells }
}
