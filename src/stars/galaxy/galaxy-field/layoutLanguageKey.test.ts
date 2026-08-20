import { describe, expect, it } from 'bun:test'
import { OTHER_LANGUAGE_KEY } from '../../utils/other-language'
import { layoutLanguageKey } from './layoutLanguageKey'

describe('layoutLanguageKey', () => {
  it('returns the language when it is a known key', () => {
    const layout = { langKeys: new Set(['TypeScript']) }
    expect(layoutLanguageKey({ language: 'TypeScript' }, layout)).toBe(
      'TypeScript',
    )
  })

  it('falls back to the other-language key for unknown or missing languages', () => {
    const layout = { langKeys: new Set(['TypeScript']) }
    expect(layoutLanguageKey({ language: 'Rust' }, layout)).toBe(
      OTHER_LANGUAGE_KEY,
    )
    expect(layoutLanguageKey({}, layout)).toBe(OTHER_LANGUAGE_KEY)
  })
})
