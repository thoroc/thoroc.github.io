import { describe, expect, it } from 'bun:test'
import { buildLanguageOptions } from './buildLanguageOptions'

describe('buildLanguageOptions', () => {
  it('buckets null language under 其他', () => {
    const result = buildLanguageOptions([
      { language: 'Rust' },
      { language: null },
    ])
    expect(result).toEqual(
      expect.arrayContaining([
        { name: 'Rust', count: 1 },
        { name: '其他', count: 1 },
      ]),
    )
  })
})
