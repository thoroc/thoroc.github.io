import { describe, expect, it } from 'bun:test'
import { scanRepoMaxima } from './scanRepoMaxima'
import type { RepoLike } from './types'

describe('scanRepoMaxima', () => {
  it('returns 1 for all maxima when the repo list is empty', () => {
    expect(scanRepoMaxima([])).toEqual({
      maxStars: 1,
      maxForks: 1,
      maxWatchers: 1,
    })
  })

  it('finds the maximum stars/forks/watchers across repos', () => {
    const repos: RepoLike[] = [
      { stars: 10, forksCount: 2, watchersCount: 5 },
      { stars: 100, forksCount: 20, watchersCount: 1 },
    ]
    expect(scanRepoMaxima(repos)).toEqual({
      maxStars: 100,
      maxForks: 20,
      maxWatchers: 5,
    })
  })

  it('treats missing/invalid numeric fields as 0', () => {
    const repos = [{ stars: Number.NaN }] as unknown as RepoLike[]
    expect(scanRepoMaxima(repos)).toEqual({
      maxStars: 1,
      maxForks: 1,
      maxWatchers: 1,
    })
  })
})
