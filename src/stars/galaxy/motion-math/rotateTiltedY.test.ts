import { describe, expect, it } from 'bun:test'
import { rotateTiltedY } from './rotateTiltedY'

describe('rotateTiltedY', () => {
  it('matches a plain Y rotation when tilt is 0', () => {
    const [x, y, z] = rotateTiltedY(1, 0, 0, Math.PI / 2, 0)
    expect(x).toBeCloseTo(0, 5)
    expect(y).toBeCloseTo(0, 5)
    expect(z).toBeCloseTo(-1, 5)
  })

  it('returns a finite result for a non-zero tilt', () => {
    const [x, y, z] = rotateTiltedY(1, 2, 3, 0.4, 0.2)
    expect(Number.isFinite(x)).toBe(true)
    expect(Number.isFinite(y)).toBe(true)
    expect(Number.isFinite(z)).toBe(true)
  })
})
