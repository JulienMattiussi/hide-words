import { normalizeWord } from '@/lib/text'
import { wordToPattern } from '@/lib/pattern'
import { createRng } from '@/lib/rng'

interface Cell {
  char: string
  on: boolean
}

export interface Grid {
  cols: number
  rows: number
  cells: Cell[]
}

export interface GridOptions {
  cols: number
  rows: number
  word: string
  fillLetters?: string
  spacing?: number
  seed?: number
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

export function buildGrid(options: GridOptions): Grid {
  const cols = Math.max(1, Math.floor(options.cols))
  const rows = Math.max(1, Math.floor(options.rows))
  const word = normalizeWord(options.word)
  const fillSource = normalizeWord(options.fillLetters ?? '') || word || 'X'
  const pattern = wordToPattern(word, options.spacing ?? 1)
  const patternHeight = pattern.length
  const patternWidth = patternHeight > 0 ? (pattern[0]?.length ?? 0) : 0
  const offsetX = Math.floor((cols - patternWidth) / 2)
  const offsetY = Math.floor((rows - patternHeight) / 2)
  const rng = createRng(options.seed ?? 1)
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
        const char = ALPHABET[Math.floor(rng() * ALPHABET.length)] ?? 'X'
        cells.push({ char, on: false })
      }
    }
  }
  return { cols, rows, cells }
}
