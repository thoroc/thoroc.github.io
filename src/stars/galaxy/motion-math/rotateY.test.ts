import { describe, expect, it } from 'bun:test'
import { rotateY } from './rotateY'

describe('rotateY', () => {
  it('leaves the point unchanged at angle 0', () => {
    expect(rotateY(1, 2, 3, 0)).toEqual([1, 2, 3])
  })

  it('rotates a point 90 degrees around Y', () => {
    const [x, y, z] = rotateY(1, 0, 0, Math.PI / 2)
    expect(x).toBeCloseTo(0, 5)
    expect(y).toBe(0)
    expect(z).toBeCloseTo(-1, 5)
  })
})
