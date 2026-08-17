import { describe, expect, it } from 'bun:test'
import { nebulaSampleRadius } from './nebulaSampleRadius'

describe('nebulaSampleRadius', () => {
  it('is deterministic for the same hash and spread', () => {
    expect(nebulaSampleRadius(123, 10)).toBe(nebulaSampleRadius(123, 10))
  })

  it('falls back to a spread of 12 when cloudSpread is not finite', () => {
    expect(nebulaSampleRadius(123, Number.NaN)).toBe(
      nebulaSampleRadius(123, 12),
    )
  })

  it('returns a non-negative radius across many hash inputs', () => {
    for (let h = 0; h < 50; h += 1) {
      expect(nebulaSampleRadius(h * 7919, 10)).toBeGreaterThanOrEqual(0)
    }
  })
})
