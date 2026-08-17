import { describe, expect, it } from 'bun:test'
import { focusDistanceForStar } from './focusDistanceForStar'

describe('focusDistanceForStar', () => {
  it('returns a larger distance for a larger star size', () => {
    const small = focusDistanceForStar(0.05)
    const large = focusDistanceForStar(1)
    expect(large).toBeGreaterThan(small)
  })

  it('clamps the result within [minDistance, maxDistance]', () => {
    expect(focusDistanceForStar(0.0001)).toBeLessThanOrEqual(3.4)
    expect(focusDistanceForStar(1000)).toBeGreaterThanOrEqual(0.09)
  })
})
