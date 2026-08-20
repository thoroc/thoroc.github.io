import { describe, expect, it } from 'bun:test'
import { OTHER_LANGUAGE_KEY } from '../other-language'
import { itemLanguageKey } from './itemLanguageKey'

describe('itemLanguageKey', () => {
  it('returns the language when present', () => {
    expect(itemLanguageKey({ language: 'Rust' })).toBe('Rust')
  })

  it('falls back to the other-language key when language is null', () => {
    expect(itemLanguageKey({ language: null })).toBe(OTHER_LANGUAGE_KEY)
  })
})
