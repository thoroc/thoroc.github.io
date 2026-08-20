import { describe, expect, it } from 'bun:test'
import { stableCollator } from './stableCollator'

describe('stableCollator', () => {
  it('sorts strings in ascending order', () => {
    expect(['Rust', 'Go', 'C++'].sort(stableCollator)).toEqual([
      'C++',
      'Go',
      'Rust',
    ])
  })

  it('returns 0 for equal strings', () => {
    expect(stableCollator('Vue', 'Vue')).toBe(0)
  })

  it('does not depend on any runtime default locale', () => {
    expect(stableCollator('a', 'b')).toBeLessThan(0)
    expect(stableCollator('b', 'a')).toBeGreaterThan(0)
  })
})
