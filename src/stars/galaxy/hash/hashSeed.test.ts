import { describe, expect, test } from 'bun:test'
import { hashSeed } from './hashSeed'

describe('hashSeed', () => {
  test('is deterministic for the same base and salt', () => {
    expect(hashSeed('lang-layout:TypeScript', 'a1')).toBe(
      hashSeed('lang-layout:TypeScript', 'a1'),
    )
  })

  test('differs when the salt changes', () => {
    expect(hashSeed('base', 'a1')).not.toBe(hashSeed('base', 'a2'))
  })

  test('differs when the base changes', () => {
    expect(hashSeed('base1', 'a1')).not.toBe(hashSeed('base2', 'a1'))
  })
})
