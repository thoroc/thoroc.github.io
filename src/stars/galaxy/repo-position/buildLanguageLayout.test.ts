import { describe, expect, it } from 'bun:test'
import { OTHER_LANGUAGE_KEY } from '../../utils/other-language'
import { buildLanguageLayout } from './buildLanguageLayout'

describe('buildLanguageLayout', () => {
  it('includes an other-language bucket for overflow languages', () => {
    const layout = buildLanguageLayout([
      { language: 'TypeScript' },
      { language: 'Rust' },
    ])
    expect(layout.langKeys.has(OTHER_LANGUAGE_KEY)).toBe(true)
  })

  it('assigns each language an angle and radius', () => {
    const layout = buildLanguageLayout([{ language: 'TypeScript' }])
    expect(layout.langAngles.has('TypeScript')).toBe(true)
    expect(layout.langRadial.has('TypeScript')).toBe(true)
  })

  it('handles an empty item list', () => {
    const layout = buildLanguageLayout([])
    expect(layout.languages.length).toBeGreaterThan(0)
  })
})
