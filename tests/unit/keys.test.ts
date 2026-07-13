import { describe, expect, it } from 'vitest'
import { analyzeKeys } from '@/lib/keys'

describe('analyzeKeys', () => {
  it('accepts a combination sharing exactly two letters', () => {
    const result = analyzeKeys('JOURNE', 'NEBCT')
    expect(result.valid).toBe(true)
    expect(new Set(result.shared)).toEqual(new Set(['N', 'E']))
    expect(new Set(result.uniqueFirst)).toEqual(new Set(['J', 'O', 'U', 'R']))
    expect(new Set(result.uniqueSecond)).toEqual(new Set(['B', 'C', 'T']))
  })

  it('rejects fewer than two shared letters', () => {
    expect(analyzeKeys('ABC', 'CDE').valid).toBe(false)
  })

  it('rejects more than two shared letters', () => {
    expect(analyzeKeys('ABCD', 'ABCE').valid).toBe(false)
  })

  it('rejects a key with no letter of its own', () => {
    const result = analyzeKeys('AB', 'ABC')
    expect(result.valid).toBe(false)
    expect(result.uniqueFirst).toHaveLength(0)
  })
})
