import { describe, expect, test } from 'bun:test'
import { gauss3 } from './gauss3'

describe('gauss3', () => {
  test('is deterministic for the same inputs', () => {
    expect(gauss3(1, 2, 3)).toBe(gauss3(1, 2, 3))
  })

  test('returns a finite number for typical hash-sized inputs', () => {
    const v = gauss3(2166136261, 16777619, 123456789)
    expect(Number.isFinite(v)).toBe(true)
  })

  test('handles the zero-input edge case without producing NaN', () => {
    expect(Number.isFinite(gauss3(0, 0, 0))).toBe(true)
  })
})
