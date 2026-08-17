import { describe, expect, it } from 'bun:test'
import { virtualStarRgb } from './virtualStarRgb'

describe('virtualStarRgb', () => {
  it('returns a finite rgb triple', () => {
    const [r, g, b] = virtualStarRgb(
      { virtualKey: 'a', topic: 'cli' },
      [0.5, 0.5, 0.5],
      0.6,
    )
    expect(Number.isFinite(r)).toBe(true)
    expect(Number.isFinite(g)).toBe(true)
    expect(Number.isFinite(b)).toBe(true)
  })

  it('is deterministic for the same input', () => {
    const a = virtualStarRgb({ virtualKey: 'x' }, [0.2, 0.3, 0.4], 0.4)
    const b = virtualStarRgb({ virtualKey: 'x' }, [0.2, 0.3, 0.4], 0.4)
    expect(a).toEqual(b)
  })
})
