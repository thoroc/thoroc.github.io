import { describe, expect, it } from 'bun:test'
import { OTHER_LANGUAGE_KEY } from '../../utils/other-language'
import { repoLegendLanguageKey } from './repoLegendLanguageKey'

describe('repoLegendLanguageKey', () => {
  it('returns the language when it is in the legend set', () => {
    expect(
      repoLegendLanguageKey(
        { language: 'TypeScript' },
        new Set(['TypeScript']),
      ),
    ).toBe('TypeScript')
  })

  it('falls back to the other-language key for a language outside the legend', () => {
    expect(repoLegendLanguageKey({ language: 'Cobol' }, ['TypeScript'])).toBe(
      OTHER_LANGUAGE_KEY,
    )
  })
})
