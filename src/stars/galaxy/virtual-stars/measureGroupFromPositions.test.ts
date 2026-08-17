import { describe, expect, it } from 'bun:test'
import { measureGroupFromPositions } from './measureGroupFromPositions'

describe('measureGroupFromPositions', () => {
  it('returns a default measurement for an empty index list', () => {
    expect(measureGroupFromPositions([], new Float32Array())).toEqual({
      cx: 0,
      cy: 0,
      cz: 0,
      spread: 14,
      n: 0,
    })
  })

  it('computes the centroid and spread of the given indices', () => {
    const positions = new Float32Array([-10, 0, 0, 10, 0, 0])
    const result = measureGroupFromPositions([0, 1], positions)
    expect(result.cx).toBeCloseTo(0)
    expect(result.n).toBe(2)
    expect(result.spread).toBeGreaterThan(0)
  })
})
