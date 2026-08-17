import { describe, expect, it } from 'bun:test'
import { buildRepoActivityById } from './buildRepoActivityById'
import type { RepoLike } from './types'

describe('buildRepoActivityById', () => {
  it('maps activity by repo id, skipping repos without an id', () => {
    const repos: RepoLike[] = [
      { id: 'a', pushedAt: '2026-01-01' },
      { pushedAt: '2026-01-01' },
    ]
    const map = buildRepoActivityById(repos, {
      maxStars: 1,
      maxForks: 1,
      maxWatchers: 1,
    })
    expect(map.has('a')).toBe(true)
    expect(map.size).toBe(1)
  })

  it('returns an empty map for an empty repo list', () => {
    const map = buildRepoActivityById([], {
      maxStars: 1,
      maxForks: 1,
      maxWatchers: 1,
    })
    expect(map.size).toBe(0)
  })
})
