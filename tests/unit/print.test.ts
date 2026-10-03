import { describe, expect, it } from 'vitest'
import { printScale } from '@/lib/print'

describe('printScale', () => {
  it('shrinks a large grid to fit the page', () => {
    expect(printScale(80, 60, 'landscape')).toBeLessThan(1)
  })

  it('enlarges a small grid to fill the page', () => {
    expect(printScale(10, 8, 'landscape')).toBeGreaterThan(1)
  })

  it('gives a wide grid more room in landscape than in portrait', () => {
    expect(printScale(60, 30, 'landscape')).toBeGreaterThan(printScale(60, 30, 'portrait'))
  })
})
