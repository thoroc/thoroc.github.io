import { describe, expect, it } from 'bun:test'
import { placeDustStar } from './placeDustStar'

describe('placeDustStar', () => {
  it('writes a finite dust-scattered position around the base', () => {
    const positions = new Float32Array(3)
    placeDustStar([5, 5, 5], 2, positions, 0, 1)
    expect(Number.isFinite(positions[0])).toBe(true)
    expect(Number.isFinite(positions[1])).toBe(true)
    expect(Number.isFinite(positions[2])).toBe(true)
  })
})
