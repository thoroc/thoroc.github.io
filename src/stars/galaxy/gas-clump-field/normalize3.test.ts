import { describe, expect, it } from 'bun:test'
import { normalize3 } from './normalize3'

describe('normalize3', () => {
  it('produces a unit-length vector', () => {
    const [x, y, z] = normalize3(3, 4, 0)
    expect(Math.hypot(x, y, z)).toBeCloseTo(1, 5)
  })

  it('falls back to a length of 1 for the zero vector', () => {
    expect(normalize3(0, 0, 0)).toEqual([0, 0, 0])
  })
})
