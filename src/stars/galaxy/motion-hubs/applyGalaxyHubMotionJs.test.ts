import { describe, expect, it } from 'bun:test'
import { applyGalaxyHubMotionJs } from './applyGalaxyHubMotionJs'

describe('applyGalaxyHubMotionJs', () => {
  it('returns the hub position unchanged at time 0', () => {
    const [x, y, z] = applyGalaxyHubMotionJs(
      5,
      0,
      0,
      [0, 0, 0],
      [0.1, 0.2, 0, 0],
      [0.05, 0, 0, 0.3],
      0,
    )
    expect(x).toBeCloseTo(5, 5)
    expect(y).toBeCloseTo(0, 5)
    expect(z).toBeCloseTo(0, 5)
  })

  it('returns a finite position for a non-zero time', () => {
    const [x, y, z] = applyGalaxyHubMotionJs(
      5,
      1,
      0,
      [1, 2, 3],
      [0.1, 0.2, 0, 0],
      [0.05, 0, 0, 0.3],
      2,
    )
    expect(Number.isFinite(x)).toBe(true)
    expect(Number.isFinite(y)).toBe(true)
    expect(Number.isFinite(z)).toBe(true)
  })
})
