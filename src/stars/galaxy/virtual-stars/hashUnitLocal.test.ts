import { describe, expect, it } from 'bun:test'
import { hashUnitLocal } from './hashUnitLocal'

describe('hashUnitLocal', () => {
  it('is deterministic for the same inputs', () => {
    expect(hashUnitLocal(12345, 3)).toBe(hashUnitLocal(12345, 3))
  })

  it('returns a value in [0, 1]', () => {
    for (const h of [0, 1, 999, 0xffffffff]) {
      const u = hashUnitLocal(h)
      expect(u).toBeGreaterThanOrEqual(0)
      expect(u).toBeLessThanOrEqual(1)
    }
  })

  it('defaults shift to 0', () => {
    expect(hashUnitLocal(42)).toBe(hashUnitLocal(42, 0))
  })

  it('varies with shift', () => {
    expect(hashUnitLocal(0xabcdef, 1)).not.toBe(hashUnitLocal(0xabcdef, 5))
  })
})
