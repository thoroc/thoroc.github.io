import { describe, expect, it } from 'bun:test'
import { compactStarItem } from './compactStarItem'
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

describe('compactStarItem', () => {
  it('keeps only the always-present fields for a minimal item', () => {
    expect(compactStarItem(item())).toEqual({
      id: 'owner-repo',
      fullName: 'owner/repo',
      stars: 5,
      starredAt: '2026-01-01T00:00:00Z',
      fork: false,
    })
  })

  it('includes every optional field when truthy', () => {
    const result = compactStarItem(
      item({
        description: 'desc',
        language: 'TypeScript',
        license: 'MIT',
        licenseUrl: 'https://example.com/license',
        createdAt: '2020-01-01T00:00:00Z',
        pushedAt: '2026-01-02T00:00:00Z',
        homepage: 'https://example.com',
        forksCount: 3,
        watchersCount: 7,
        topics: ['cli'],
      }),
    )
    expect(result).toMatchObject({
      description: 'desc',
      language: 'TypeScript',
      license: 'MIT',
      licenseUrl: 'https://example.com/license',
      createdAt: '2020-01-01T00:00:00Z',
      pushedAt: '2026-01-02T00:00:00Z',
      homepage: 'https://example.com',
      forksCount: 3,
      watchersCount: 7,
      topics: ['cli'],
    })
  })

  it('omits zero-valued optional numeric fields and empty topics', () => {
    const result = compactStarItem(
      item({ forksCount: 0, watchersCount: 0, topics: [] }),
    )
    expect(result).not.toHaveProperty('forksCount')
    expect(result).not.toHaveProperty('watchersCount')
    expect(result).not.toHaveProperty('topics')
  })
})
