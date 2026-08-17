import { describe, expect, it } from 'bun:test'
import { nebulaDustRgb } from './nebulaDustRgb'

describe('nebulaDustRgb', () => {
  it('blends toward the language colour as density increases', () => {
    const lang: [number, number, number] = [1, 1, 1]
    const sparse = nebulaDustRgb(lang, 0)
    const dense = nebulaDustRgb(lang, 1)
    expect(dense[0]).toBeGreaterThan(sparse[0])
  })

  it('stays dark and desaturated at zero density', () => {
    const [r, g, b] = nebulaDustRgb([1, 1, 1], 0)
    expect(r).toBeCloseTo(0.035, 5)
    expect(g).toBeCloseTo(0.028, 5)
    expect(b).toBeCloseTo(0.022, 5)
  })
})
