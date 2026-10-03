import { bitsOf, popcount } from '@/lib/bits'
import { normalizeLetters } from '@/lib/text'

export interface KeyStatus {
  valid: boolean
  reason: string
}

function describeRegion(mask: number, count: number): string {
  return bitsOf(mask, count)
    .map((index) => `code ${index + 1}`)
    .join(' & ')
}

export function regionLetters(keys: string[], mask: number): string[] {
  const count = keys.length
  const sets = keys.map((key) => new Set([...key]))
  const inside = bitsOf(mask, count)
  if (inside.length === 0) return []
  const firstSet = sets[inside[0] ?? 0] ?? new Set<string>()
  const result: string[] = []
  for (const char of firstSet) {
    const inAllInside = inside.every((index) => sets[index]?.has(char))
    const inNoneOutside = sets.every((set, index) => (mask & (1 << index) ? true : !set.has(char)))
    if (inAllInside && inNoneOutside) result.push(char)
  }
  return result
}

export function validateKeys(keys: string[], regions: number[]): KeyStatus {
  const count = keys.length
  for (const mask of regions) {
    if (regionLetters(keys, mask).length === 0) {
      return {
        valid: false,
        reason: `Aucune lettre propre pour ${describeRegion(mask, count)}.`,
      }
    }
  }
  return { valid: true, reason: '' }
}

const MAX_KEY_LENGTH = 4

export function autoKeys(count: number, regions: number[], pool: string): string[] {
  const letters = [...normalizeLetters(pool)]
  const keys: string[] = Array.from({ length: count }, () => '')
  const ordered = [...regions].sort((a, b) => popcount(a) - popcount(b) || a - b)
  let cursor = 0

  const assign = (mask: number, letter: string) => {
    for (let i = 0; i < count; i++) {
      if (mask & (1 << i)) keys[i] += letter
    }
  }

  for (const mask of ordered) {
    if (cursor >= letters.length - 1) break
    assign(mask, letters[cursor] ?? 'X')
    cursor += 1
  }
  for (const mask of ordered) {
    if (popcount(mask) !== 1) continue
    const index = bitsOf(mask, count)[0] ?? 0
    while (cursor < letters.length - 1 && (keys[index] ?? '').length < MAX_KEY_LENGTH) {
      assign(mask, letters[cursor] ?? 'X')
      cursor += 1
    }
  }
  return keys
}
