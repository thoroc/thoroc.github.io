import { describe, expect, test } from 'bun:test'
import { hashStr } from './hashStr'

describe('hashStr', () => {
  test('is deterministic for the same input', () => {
    expect(hashStr('repo-anchor')).toBe(hashStr('repo-anchor'))
  })

  test('differs for different input', () => {
    expect(hashStr('a')).not.toBe(hashStr('b'))
  })

  test('returns an unsigned 32-bit integer', () => {
    const h = hashStr('some-key')
    expect(Number.isInteger(h)).toBe(true)
    expect(h).toBeGreaterThanOrEqual(0)
    expect(h).toBeLessThanOrEqual(0xffffffff)
  })

  test('treats null/undefined as an empty string', () => {
    expect(hashStr(null)).toBe(hashStr(''))
    expect(hashStr(undefined)).toBe(hashStr(''))
  })

  test('coerces non-string input via String()', () => {
    expect(hashStr(42)).toBe(hashStr('42'))
  })
})
