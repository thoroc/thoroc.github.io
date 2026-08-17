import { describe, expect, it } from 'bun:test'
import { volumeOffset } from './volumeOffset'

describe('volumeOffset', () => {
  it('returns a finite 3D offset', () => {
    const [x, y, z] = volumeOffset(1, {
      ySeed: [0.1, 0.2, 0.3],
      rSeed: [0.4, 0.5, 0.6],
    })
    expect(Number.isFinite(x)).toBe(true)
    expect(Number.isFinite(y)).toBe(true)
    expect(Number.isFinite(z)).toBe(true)
  })
})
