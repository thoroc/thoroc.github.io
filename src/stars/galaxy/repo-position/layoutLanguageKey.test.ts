import { describe, expect, it } from 'bun:test'
import { OTHER_LANGUAGE_KEY } from '../../utils/other-language'
import { buildLanguageLayout } from './buildLanguageLayout'
import { layoutLanguageKey } from './layoutLanguageKey'

describe('layoutLanguageKey', () => {
  it('returns the language when it is in the layout', () => {
    const layout = buildLanguageLayout([{ language: 'TypeScript' }])
    expect(layoutLanguageKey({ language: 'TypeScript' }, layout)).toBe(
      'TypeScript',
    )
  })

  it('falls back to the other-language key for a language outside the layout', () => {
    const layout = buildLanguageLayout([{ language: 'TypeScript' }])
    expect(layoutLanguageKey({ language: 'Cobol' }, layout)).toBe(
      OTHER_LANGUAGE_KEY,
    )
  })
})
