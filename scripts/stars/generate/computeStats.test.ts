import { describe, expect, it } from 'bun:test'
import { computeStats } from './computeStats'
import type { NormalizedStarItem } from './types'

const item = (
  overrides: Partial<NormalizedStarItem> = {},
): NormalizedStarItem => ({
  id: 'owner-repo',
  fullName: 'owner/repo',
  description: '',
  language: null,
  license: null,
  licenseUrl: null,
  stars: 5,
  starredAt: '2026-01-01T00:00:00Z',
  createdAt: '',
  pushedAt: '',
  homepage: null,
  forksCount: 0,
  watchersCount: 0,
  topics: [],
  fork: false,
  isTemplate: false,
  ...overrides,
})

describe('computeStats', () => {
  it('returns zeroed totals for an empty list', () => {
    const stats = computeStats([])
    expect(stats.totals).toEqual({
      total: 0,
      languages: 0,
      licenses: 0,
      withLicense: 0,
      forks: 0,
      templates: 0,
    })
    expect(stats.starredByYear).toEqual([])
  })

  it('buckets language, license, year, fork, template, and star-count stats', () => {
    const stats = computeStats([
      item({
        language: 'TypeScript',
        license: 'MIT',
        starredAt: '2026-03-01',
        stars: 500,
      }),
      item({
        language: 'TypeScript',
        starredAt: '2025-06-01',
        stars: 5000,
        fork: true,
      }),
      item({
        language: null,
        starredAt: '2025-01-01',
        stars: 20000,
        isTemplate: true,
      }),
      item({ language: 'Rust', starredAt: '2026-05-01', stars: 60000 }),
    ])
    expect(stats.totals).toEqual({
      total: 4,
      languages: 3,
      licenses: 1,
      withLicense: 1,
      forks: 1,
      templates: 1,
    })
    expect(stats.starredByYear).toEqual([
      { year: '2025', count: 2 },
      { year: '2026', count: 2 },
    ])
    expect(stats.starBuckets).toEqual([
      { key: 'under1k', count: 1 },
      { key: 'from1k', count: 1 },
      { key: 'from10k', count: 1 },
      { key: 'from50k', count: 1 },
    ])
  })

  it('sorts top languages/licenses by count desc, then name asc on ties', () => {
    const stats = computeStats([
      item({ language: 'Rust' }),
      item({ language: 'Go' }),
      item({ language: 'TypeScript' }),
      item({ language: 'TypeScript' }),
    ])
    expect(stats.topLanguages[0]).toEqual({ name: 'TypeScript', count: 2 })
    expect(stats.topLanguages.slice(1)).toEqual([
      { name: 'Go', count: 1 },
      { name: 'Rust', count: 1 },
    ])
  })

  it('defaults an item with no language to "Other"', () => {
    const stats = computeStats([item({ language: null })])
    expect(stats.topLanguages).toEqual([{ name: 'Other', count: 1 }])
  })

  it('caps topLanguages/topLicenses at 5 entries', () => {
    const items = ['a', 'b', 'c', 'd', 'e', 'f'].map((lang) =>
      item({ language: lang }),
    )
    const stats = computeStats(items)
    expect(stats.topLanguages).toHaveLength(5)
  })
})
