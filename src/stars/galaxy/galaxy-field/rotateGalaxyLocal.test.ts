import { describe, expect, it } from 'bun:test'
import { rotateGalaxyLocal } from './rotateGalaxyLocal'

describe('rotateGalaxyLocal', () => {
  it('returns the same point when all tilts are zero', () => {
    expect(rotateGalaxyLocal(1, 2, 3, 0, 0)).toEqual([1, 2, 3])
  })

  it('applies the tiltY branch when tiltY is non-zero', () => {
    const [x, , z] = rotateGalaxyLocal(1, 0, 0, 0, 0, Math.PI / 2)
    expect(x).toBeCloseTo(0, 5)
    expect(z).toBeCloseTo(-1, 5)
  })
})
