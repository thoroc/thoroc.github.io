import { describe, expect, it } from 'bun:test'
import { filterStars } from './filterStars'
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
    stars: 2,
    starredAt: '2025-01-01',
    pushedAt: '2025-01-01',
  },
]

describe('filterStars', () => {
  it('always sorts by recently_starred regardless of the requested sort', () => {
    const opts: FilterOptions = {
      q: '',
      language: 'all',
      license: 'all',
      starredYear: 'all',
      type: 'all',
      sort: 'most_stars',
    }
    expect(filterStars(items, opts).map((i) => i.fullName)).toEqual([
      'a/one',
      'b/two',
    ])
  })

  it('preserves item count when filters are permissive', () => {
    const opts: FilterOptions = {
      q: '',
      language: 'all',
      license: 'all',
      starredYear: 'all',
      type: 'all',
      sort: 'recently_starred',
    }
    expect(filterStars(items, opts)).toHaveLength(2)
  })
})
