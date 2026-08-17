import { describe, expect, it } from 'bun:test'
import { positionsFiniteRatio } from './positionsFiniteRatio'

describe('positionsFiniteRatio', () => {
  it('returns 0 for empty or missing input', () => {
    expect(positionsFiniteRatio(undefined)).toBe(0)
    expect(positionsFiniteRatio([])).toBe(0)
  })

  it('returns the ratio of finite values', () => {
    expect(positionsFiniteRatio([1, 2, Number.NaN, 4])).toBe(0.75)
  })

  it('returns 1 when all values are finite', () => {
    expect(positionsFiniteRatio([1, 2, 3])).toBe(1)
  })
})
