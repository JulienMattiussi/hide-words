import { describe, expect, it } from 'vitest'
import { normalizeLetters, normalizeTextLines } from '@/lib/text'

describe('normalizeLetters', () => {
  it('keeps letters, digits, case and French accents but drops the rest', () => {
    expect(normalizeLetters('Été 42 !')).toBe('Été42')
    expect(normalizeLetters('a-b_c')).toBe('abc')
  })
})

describe('normalizeTextLines', () => {
  it('splits on newlines, trims and collapses inner spaces', () => {
    expect(normalizeTextLines('Bonjour  le\nmonde !')).toEqual(['Bonjour le', 'monde'])
  })

  it('keeps blank lines as empty entries', () => {
    expect(normalizeTextLines('a\n\nb')).toEqual(['a', '', 'b'])
  })

  it('preserves accents and case', () => {
    expect(normalizeTextLines('Château')).toEqual(['Château'])
  })
})
