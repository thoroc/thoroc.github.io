import { describe, expect, it } from 'bun:test'
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

  it('falls back to 其他 for a language outside the legend', () => {
    expect(repoLegendLanguageKey({ language: 'Cobol' }, ['TypeScript'])).toBe(
      '其他',
    )
  })
})
