import { describe, expect, it } from 'bun:test'
import { easeInOutCubic } from './easeInOutCubic'

describe('easeInOutCubic', () => {
  it('returns 0 at t=0 and 1 at t=1', () => {
    expect(easeInOutCubic(0)).toBe(0)
    expect(easeInOutCubic(1)).toBe(1)
  })

  it('returns 0.5 at t=0.5', () => {
    expect(easeInOutCubic(0.5)).toBeCloseTo(0.5)
  })

  it('clamps values outside [0, 1]', () => {
    expect(easeInOutCubic(-1)).toBe(0)
    expect(easeInOutCubic(2)).toBe(1)
  })

  it('uses the first-half cubic branch below 0.5', () => {
    expect(easeInOutCubic(0.25)).toBeCloseTo(4 * 0.25 ** 3)
  })
})
