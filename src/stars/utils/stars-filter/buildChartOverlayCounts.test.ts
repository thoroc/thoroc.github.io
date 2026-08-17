import { describe, expect, it } from 'bun:test'
import { buildChartOverlayCounts } from './buildChartOverlayCounts'
import { itemLanguageKey } from './itemLanguageKey'
import type { FilterOptions, StarItem } from './types'

const items: StarItem[] = [
  {
    fullName: 'a/one',
    language: 'Rust',
    license: 'MIT',
    fork: false,
    stars: 1,
    starredAt: '2026-01-01',
    pushedAt: '2026-01-01',
  },
  {
    fullName: 'b/two',
    language: 'Python',
    license: 'MIT',
    fork: false,
    stars: 1,
    starredAt: '2026-01-01',
    pushedAt: '2026-01-01',
  },
]

const baseState: FilterOptions = {
  q: '',
  language: 'Rust',
  license: 'all',
  starredYear: 'all',
  type: 'all',
  sort: 'recently_starred',
}

describe('buildChartOverlayCounts', () => {
  it('relaxes the language filter when dimension is language', () => {
    const counts = buildChartOverlayCounts(
      items,
      baseState,
      'language',
      ['Rust', 'Python'],
      itemLanguageKey,
    )
    expect(counts.get('Rust')).toBe(1)
    expect(counts.get('Python')).toBe(1)
  })

  it('keeps unrequested keys at 0', () => {
    const counts = buildChartOverlayCounts(
      items,
      baseState,
      'language',
      ['Rust', 'Go'],
      itemLanguageKey,
    )
    expect(counts.get('Go')).toBe(0)
  })

  it('relaxes license and starredYear dimensions', () => {
    const licenseCounts = buildChartOverlayCounts(
      items,
      { ...baseState, license: 'Apache-2.0' },
      'license',
      ['Rust', 'Python'],
      itemLanguageKey,
    )
    expect(licenseCounts.get('Rust')).toBe(1)

    const yearCounts = buildChartOverlayCounts(
      items,
      { ...baseState, language: 'all', starredYear: '2020' },
      'starredYear',
      ['Rust', 'Python'],
      itemLanguageKey,
    )
    expect(yearCounts.get('Python')).toBe(1)
  })
})
