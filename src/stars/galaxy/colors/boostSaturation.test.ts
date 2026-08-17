import { describe, expect, it } from 'bun:test'
import { boostSaturation } from './boostSaturation'

describe('boostSaturation', () => {
  it('pushes channels away from the luminance midpoint', () => {
    const [r, g, b] = boostSaturation([0.6, 0.4, 0.4])
    expect(r).toBeGreaterThan(0.6)
    expect(g).toBeLessThan(0.4)
    expect(b).toBeLessThan(0.4)
  })

  it('clamps channels to a maximum of 1', () => {
    const [r] = boostSaturation([1, 0, 0], 5)
    expect(r).toBe(1)
  })

  it('leaves a neutral grey unchanged', () => {
    expect(boostSaturation([0.5, 0.5, 0.5])).toEqual([0.5, 0.5, 0.5])
  })
})
