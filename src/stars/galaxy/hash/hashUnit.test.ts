import { describe, expect, test } from 'bun:test'
import { hashStr } from './hashStr'
import { hashUnit } from './hashUnit'

describe('hashUnit', () => {
  test('returns a value in [0, 1)', () => {
    const h = hashStr('some-virtual-key')
    for (let shift = 0; shift < 8; shift += 1) {
      const u = hashUnit(h, shift)
      expect(u).toBeGreaterThanOrEqual(0)
      expect(u).toBeLessThan(1)
    }
  })

  test('is deterministic for the same hash and shift', () => {
    const h = hashStr('key')
    expect(hashUnit(h, 3)).toBe(hashUnit(h, 3))
  })

  test('differs across shifts for the same hash', () => {
    const h = hashStr('key')
    expect(hashUnit(h, 1)).not.toBe(hashUnit(h, 2))
  })

  test('defaults shift to 0 when omitted', () => {
    const h = hashStr('key')
    expect(hashUnit(h)).toBe(hashUnit(h, 0))
  })
})
