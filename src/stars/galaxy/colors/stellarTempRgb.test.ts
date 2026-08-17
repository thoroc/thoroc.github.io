import { describe, expect, it } from 'bun:test'
import { stellarTempRgb } from './stellarTempRgb'

describe('stellarTempRgb', () => {
  it('returns a unit-length rgb vector', () => {
    const [r, g, b] = stellarTempRgb(0.5)
    const len = Math.hypot(r, g, b)
    expect(len).toBeCloseTo(1, 5)
  })

  it('shifts warmer with lower influence', () => {
    const cool = stellarTempRgb(1)
    const warm = stellarTempRgb(0)
    expect(warm[0]).toBeGreaterThan(cool[0])
  })

  it('applies the hash jitter offset', () => {
    const base = stellarTempRgb(0.5, 0)
    const jittered = stellarTempRgb(0.5, 0.1)
    expect(jittered).not.toEqual(base)
  })
})
