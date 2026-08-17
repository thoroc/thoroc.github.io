import { describe, expect, it } from 'bun:test'
import { filterAndSortStars } from './filterAndSortStars'
import type { FilterOptions, StarItem } from './types'

const items: StarItem[] = [
  {
    fullName: 'a/rust-cli',
    description: 'a cli tool',
    topics: ['cli', 'rust'],
    language: 'Rust',
    license: 'MIT',
    fork: false,
    stars: 50,
    starredAt: '2026-03-01',
    pushedAt: '2026-05-01',
  },
  {
    fullName: 'b/py-web',
    description: 'a web framework',
    topics: ['web'],
    language: 'Python',
    license: 'Apache-2.0',
    fork: true,
    stars: 200,
    starredAt: '2025-01-01',
    pushedAt: '2026-01-01',
  },
  {
    fullName: 'c/no-lang',
    topics: [],
    language: null,
    license: null,
    fork: false,
    stars: 5,
    starredAt: '2024-06-01',
    pushedAt: '2024-06-01',
  },
]

const baseOpts: FilterOptions = {
  q: '',
  language: 'all',
  license: 'all',
  starredYear: 'all',
  type: 'all',
  sort: 'recently_starred',
}

describe('filterAndSortStars', () => {
  it('returns all items sorted by starredAt desc by default', () => {
    const result = filterAndSortStars(items, baseOpts)
    expect(result.map((i) => i.fullName)).toEqual([
      'a/rust-cli',
      'b/py-web',
      'c/no-lang',
    ])
  })

  it('filters by topic tag (AND across multiple tags)', () => {
    const result = filterAndSortStars(items, { ...baseOpts, q: '#cli #rust' })
    expect(result.map((i) => i.fullName)).toEqual(['a/rust-cli'])
  })

  it('filters by free text across fullName, description, and topics', () => {
    expect(
      filterAndSortStars(items, { ...baseOpts, q: 'framework' }).map(
        (i) => i.fullName,
      ),
    ).toEqual(['b/py-web'])
    expect(
      filterAndSortStars(items, { ...baseOpts, q: 'web' }).map(
        (i) => i.fullName,
      ),
    ).toEqual(['b/py-web'])
  })

  it('filters by language, including 其他 for null language', () => {
    expect(
      filterAndSortStars(items, { ...baseOpts, language: 'Rust' }).map(
        (i) => i.fullName,
      ),
    ).toEqual(['a/rust-cli'])
    expect(
      filterAndSortStars(items, { ...baseOpts, language: '其他' }).map(
        (i) => i.fullName,
      ),
    ).toEqual(['c/no-lang'])
  })

  it('filters by license', () => {
    expect(
      filterAndSortStars(items, { ...baseOpts, license: 'MIT' }).map(
        (i) => i.fullName,
      ),
    ).toEqual(['a/rust-cli'])
  })

  it('filters by starredYear prefix', () => {
    expect(
      filterAndSortStars(items, { ...baseOpts, starredYear: '2025' }).map(
        (i) => i.fullName,
      ),
    ).toEqual(['b/py-web'])
  })

  it('filters by type sources/forks', () => {
    expect(
      filterAndSortStars(items, { ...baseOpts, type: 'forks' }).map(
        (i) => i.fullName,
      ),
    ).toEqual(['b/py-web'])
    expect(
      filterAndSortStars(items, { ...baseOpts, type: 'sources' }).map(
        (i) => i.fullName,
      ),
    ).toEqual(['a/rust-cli', 'c/no-lang'])
  })

  it('sorts by most_stars', () => {
    expect(
      filterAndSortStars(items, { ...baseOpts, sort: 'most_stars' }).map(
        (i) => i.fullName,
      ),
    ).toEqual(['b/py-web', 'a/rust-cli', 'c/no-lang'])
  })

  it('sorts by recently_active (pushedAt)', () => {
    expect(
      filterAndSortStars(items, {
        ...baseOpts,
        sort: 'recently_active',
      }).map((i) => i.fullName),
    ).toEqual(['a/rust-cli', 'b/py-web', 'c/no-lang'])
  })
})
