import { describe, expect, it } from 'bun:test'
import { itemLanguageKey } from './itemLanguageKey'

describe('itemLanguageKey', () => {
  it('returns the language when present', () => {
    expect(itemLanguageKey({ language: 'Rust' })).toBe('Rust')
  })

  it('falls back to 其他 when language is null', () => {
    expect(itemLanguageKey({ language: null })).toBe('其他')
  })
})
