import { describe, expect, it } from 'vitest'
import { normalizeWord } from '@/lib/text'

describe('normalizeWord', () => {
  it('keeps letters, digits, case and French accents', () => {
    expect(normalizeWord('Élan 42')).toBe('Élan42')
    expect(normalizeWord('Château')).toBe('Château')
    expect(normalizeWord('Ça va ?')).toBe('Çava')
  })

  it('drops unsupported characters', () => {
    expect(normalizeWord('a-b_c!d')).toBe('abcd')
    expect(normalizeWord('  \n\t')).toBe('')
  })

  it('recomposes decomposed accents to a single code point', () => {
    const decomposed = 'é'
    expect(normalizeWord(decomposed)).toBe('é')
  })
})
