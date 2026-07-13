import { normalizeLetters } from '@/lib/text'
import { textToPattern } from '@/lib/pattern'
import { createRng } from '@/lib/rng'
import { analyzeKeys } from '@/lib/keys'
import type { KeyAnalysis } from '@/lib/keys'
import { bestOffset, placeMasks } from '@/lib/layout'
import type { Offset } from '@/lib/layout'

interface Cell {
  char: string
  primary: boolean
  secondary: boolean
}

export type Orientation = 'landscape' | 'portrait'

interface CodeInput {
  text: string
  key?: string
}

export interface Grid {
  cols: number
  rows: number
  cells: Cell[]
  offset: Offset
  keys: KeyAnalysis
  secondActive: boolean
}

export interface GridOptions {
  orientation: Orientation
  first: CodeInput
  second?: CodeInput
  offset?: Offset
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

function distinct(input: string): string[] {
  return [...new Set([...input])]
}

function pick(letters: string[], index: number): string {
  if (letters.length === 0) return 'X'
  return letters[index % letters.length] ?? 'X'
}

export function buildGrid(options: GridOptions): Grid {
  const letterSpacing = options.letterSpacing ?? 1
  const lineSpacing = options.lineSpacing ?? 1

  const firstKeySource =
    normalizeLetters(options.first.key ?? '') || normalizeLetters(options.first.text) || 'X'
  const secondText = options.second?.text ?? ''
  const secondKeySource =
    normalizeLetters(options.second?.key ?? '') || normalizeLetters(secondText)

  const keys = analyzeKeys(firstKeySource, secondKeySource)
  const secondActive = secondText.trim().length > 0 && keys.valid

  const patternA = textToPattern(options.first.text, letterSpacing, lineSpacing)
  const patternB = secondActive ? textToPattern(secondText, letterSpacing, lineSpacing) : []
  const offset = options.offset ?? bestOffset(patternA, patternB)
  const placement = placeMasks(patternA, patternB, offset.dx, offset.dy)

  const firstLetters = secondActive ? keys.uniqueFirst : distinct(firstKeySource)
  const secondLetters = keys.uniqueSecond
  const sharedLetters = keys.shared
  const noise = noiseAlphabet(firstKeySource + (secondActive ? secondKeySource : ''))

  let cols = placement.cols + 2 * MARGIN
  let rows = placement.rows + 2 * MARGIN
  if (options.orientation === 'landscape') {
    cols = Math.max(cols, Math.round(rows * ASPECT_RATIO))
  } else {
    rows = Math.max(rows, Math.round(cols * ASPECT_RATIO))
  }
  cols = Math.max(1, cols)
  rows = Math.max(1, rows)

  const offsetX = Math.floor((cols - placement.cols) / 2)
  const offsetY = Math.floor((rows - placement.rows) / 2)
  const rng = createRng(options.seed ?? 1)

  const cells: Cell[] = []
  let firstIndex = 0
  let secondIndex = 0
  let sharedIndex = 0
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const cy = y - offsetY
      const cx = x - offsetX
      const inContent = cy >= 0 && cy < placement.rows && cx >= 0 && cx < placement.cols
      const primary = inContent && (placement.primary[cy]?.[cx] ?? false)
      const secondary = inContent && (placement.secondary[cy]?.[cx] ?? false)
      let char: string
      if (primary && secondary) {
        char = pick(sharedLetters, sharedIndex)
        sharedIndex += 1
      } else if (primary) {
        char = pick(firstLetters, firstIndex)
        firstIndex += 1
      } else if (secondary) {
        char = pick(secondLetters, secondIndex)
        secondIndex += 1
      } else {
        char = noise[Math.floor(rng() * noise.length)] ?? 'X'
      }
      cells.push({ char, primary, secondary })
    }
  }

  return { cols, rows, cells, offset, keys, secondActive }
}
