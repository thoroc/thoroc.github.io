import { describe, expect, it } from 'bun:test'
import { buildLanguageLegend } from './buildLanguageLegend'

describe('buildLanguageLegend', () => {
  it('ranks languages by count and caps at topN', () => {
    const legend = buildLanguageLegend(
      [
        { language: 'TypeScript' },
        { language: 'TypeScript' },
        { language: 'Rust' },
      ],
      1,
    )
    expect(legend).toEqual([{ name: 'TypeScript', count: 2 }])
  })

  it('handles missing items', () => {
    expect(buildLanguageLegend(undefined)).toEqual([])
  })
})
