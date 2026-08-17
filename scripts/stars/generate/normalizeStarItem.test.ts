import { describe, expect, it } from 'bun:test'
import { normalizeStarItem } from './normalizeStarItem'
import type { RawGithubRepo } from './types'

describe('normalizeStarItem', () => {
  it('normalizes a full GitHub repo payload', () => {
    const repo: RawGithubRepo = {
      full_name: 'Owner/Repo',
      description: 'desc',
      language: 'TypeScript',
      license: { spdx_id: 'MIT' },
      stargazers_count: 42,
      starred_at: '2026-01-01T00:00:00Z',
      created_at: '2020-01-01T00:00:00Z',
      pushed_at: '2026-01-02T00:00:00Z',
      homepage: '  https://example.com  ',
      forks_count: 3,
      subscribers_count: 7,
      topics: ['cli'],
      fork: true,
      is_template: true,
    }
    expect(normalizeStarItem(repo)).toEqual({
      id: 'owner-repo',
      fullName: 'Owner/Repo',
      description: 'desc',
      language: 'TypeScript',
      license: 'MIT',
      licenseUrl: 'https://github.com/Owner/Repo/blob/HEAD/LICENSE',
      stars: 42,
      starredAt: '2026-01-01T00:00:00Z',
      createdAt: '2020-01-01T00:00:00Z',
      pushedAt: '2026-01-02T00:00:00Z',
      homepage: 'https://example.com',
      forksCount: 3,
      watchersCount: 7,
      topics: ['cli'],
      fork: true,
      isTemplate: true,
    })
  })

  it('applies defaults for a minimal repo payload', () => {
    const result = normalizeStarItem({ full_name: 'owner/repo' })
    expect(result).toEqual({
      id: 'owner-repo',
      fullName: 'owner/repo',
      description: '',
      language: null,
      license: null,
      licenseUrl: null,
      stars: 0,
      starredAt: '',
      createdAt: '',
      pushedAt: '',
      homepage: null,
      forksCount: 0,
      watchersCount: 0,
      topics: [],
      fork: false,
      isTemplate: false,
    })
  })

  it('falls back to watchers_count and updated_at when the primary fields are absent', () => {
    const result = normalizeStarItem({
      full_name: 'owner/repo',
      watchers_count: 9,
      updated_at: '2026-02-02T00:00:00Z',
    })
    expect(result.watchersCount).toBe(9)
    expect(result.pushedAt).toBe('2026-02-02T00:00:00Z')
  })

  it('blanks a whitespace-only homepage', () => {
    expect(
      normalizeStarItem({ full_name: 'owner/repo', homepage: '   ' }).homepage,
    ).toBeNull()
  })
})
