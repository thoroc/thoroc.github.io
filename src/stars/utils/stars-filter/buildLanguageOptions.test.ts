import { describe, expect, it } from 'bun:test'
import { OTHER_LANGUAGE_KEY } from '../other-language'
import { buildLanguageOptions } from './buildLanguageOptions'

describe('buildLanguageOptions', () => {
  it('buckets null language under the other-language key', () => {
    const result = buildLanguageOptions([
      { language: 'Rust' },
      { language: null },
    ])
    expect(result).toEqual(
      expect.arrayContaining([
        { name: 'Rust', count: 1 },
        { name: OTHER_LANGUAGE_KEY, count: 1 },
      ]),
    )
  })
})
