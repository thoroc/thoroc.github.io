import { describe, expect, it } from 'bun:test'
import { pushRecencyScore } from './pushRecencyScore'

describe('pushRecencyScore', () => {
  it('returns the floor score for unparseable input', () => {
    expect(pushRecencyScore(undefined)).toBe(0.08)
  })

  it('returns near 1 for a very recent push', () => {
    expect(pushRecencyScore(new Date().toISOString())).toBeCloseTo(1, 1)
  })

  it('returns the floor for a very old push', () => {
    expect(pushRecencyScore('2000-01-01')).toBe(0.05)
  })
})
