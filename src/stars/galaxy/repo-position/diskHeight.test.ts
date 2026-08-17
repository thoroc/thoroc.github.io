import { describe, expect, it } from 'bun:test'
import { diskHeight } from './diskHeight'

describe('diskHeight', () => {
  it('returns a finite height', () => {
    const y = diskHeight(1, {
      rr: 10,
      ang: 0.5,
      t: 0.3,
      ySeed: [0.1, 0.2, 0.3],
      starNorm: 0.5,
      act: 0.5,
    })
    expect(Number.isFinite(y)).toBe(true)
  })
})
