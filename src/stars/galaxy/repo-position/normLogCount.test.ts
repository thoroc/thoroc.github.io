import { describe, expect, it } from 'bun:test'
import { normLogCount } from './normLogCount'

describe('normLogCount', () => {
  it('returns 1 at the max value', () => {
    expect(normLogCount(100, 100)).toBe(1)
  })

  it('returns 0 for a missing value', () => {
    expect(normLogCount(undefined, 100)).toBe(0)
  })

  it('clamps max to at least 1', () => {
    expect(normLogCount(5, 0)).toBe(normLogCount(5, 1))
  })
})
