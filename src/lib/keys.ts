import { normalizeLetters } from '@/lib/text'

export interface KeyAnalysis {
  uniqueFirst: string[]
  uniqueSecond: string[]
  shared: string[]
  valid: boolean
  reason: string
}

function distinct(input: string): string[] {
  return [...new Set([...input])]
}

export function analyzeKeys(firstKey: string, secondKey: string): KeyAnalysis {
  const a = distinct(normalizeLetters(firstKey))
  const b = distinct(normalizeLetters(secondKey))
  const inB = new Set(b)
  const inA = new Set(a)
  const shared = a.filter((char) => inB.has(char))
  const uniqueFirst = a.filter((char) => !inB.has(char))
  const uniqueSecond = b.filter((char) => !inA.has(char))

  let valid = true
  let reason = ''
  if (shared.length !== 2) {
    valid = false
    reason = `Les deux clés doivent partager exactement 2 lettres (actuellement ${shared.length}).`
  } else if (uniqueFirst.length < 1) {
    valid = false
    reason = 'La clé du code 1 doit garder au moins une lettre qui lui est propre.'
  } else if (uniqueSecond.length < 1) {
    valid = false
    reason = 'La clé du code 2 doit garder au moins une lettre qui lui est propre.'
  }

  return { uniqueFirst, uniqueSecond, shared, valid, reason }
}
