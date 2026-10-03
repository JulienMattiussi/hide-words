import { normalizeLetters } from '@/lib/text'
import { textToPattern } from '@/lib/pattern'
import { createRng } from '@/lib/rng'
import { autoKeys, regionLetters, validateKeys } from '@/lib/keys'
import type { KeyStatus } from '@/lib/keys'
import { autoOffsets, composeMasks } from '@/lib/layout'
import type { Offset } from '@/lib/layout'

interface Cell {
  char: string
  mask: number
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
  keys: string[]
  suggested: string[]
  keyStatus: KeyStatus
  count: number
}

export interface GridOptions {
  orientation: Orientation
  codes: CodeInput[]
  offsets?: Offset[]
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
  if (pool === '') pool = UPPER
  const filtered = [...pool].filter((char) => !used.has(char)).join('')
  return filtered.length > 0 ? filtered : pool
}

function pick(letters: string[], index: number): string {
  if (letters.length === 0) return 'X'
  return letters[index % letters.length] ?? 'X'
}

export function buildGrid(options: GridOptions): Grid {
  const count = options.codes.length

  const patterns = options.codes.map((code) => textToPattern(code.text))
  const offsets = options.offsets ?? autoOffsets(patterns)
  const placement = composeMasks(patterns, offsets)

  const maskGrid: number[][] = []
  const occupied = new Set<number>()
  for (let y = 0; y < placement.rows; y++) {
    const row: number[] = []
    for (let x = 0; x < placement.cols; x++) {
      let mask = 0
      for (let k = 0; k < count; k++) {
        if (placement.masks[k]?.[y]?.[x]) mask |= 1 << k
      }
      if (mask > 0) occupied.add(mask)
      row.push(mask)
    }
    maskGrid.push(row)
  }

  const regions = [...occupied]
  const generated = autoKeys(count, regions, UPPER)
  const manual = options.codes.map((code, index) =>
    patterns[index]?.length ? normalizeLetters(code.key ?? '') || normalizeLetters(code.text) : '',
  )
  const keyStatus = validateKeys(manual, regions)
  const keys = keyStatus.valid ? manual : generated

  const regionMap = new Map<number, string[]>()
  for (const mask of regions) {
    regionMap.set(mask, regionLetters(keys, mask))
  }
  const noise = noiseAlphabet(keys.join(''))

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
  const counters = new Map<number, number>()

  const cells: Cell[] = []
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const cy = y - offsetY
      const cx = x - offsetX
      const inContent = cy >= 0 && cy < placement.rows && cx >= 0 && cx < placement.cols
      const mask = inContent ? (maskGrid[cy]?.[cx] ?? 0) : 0
      let char: string
      if (mask > 0) {
        const letters = regionMap.get(mask) ?? []
        const index = counters.get(mask) ?? 0
        char = pick(letters, index)
        counters.set(mask, index + 1)
      } else {
        char = noise[Math.floor(rng() * noise.length)] ?? 'X'
      }
      cells.push({ char, mask })
    }
  }

  return { cols, rows, cells, keys, suggested: generated, keyStatus, count }
}
