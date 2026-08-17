import { describe, expect, it } from 'bun:test'
import { repoSizeScore } from './repoSizeScore'

const ctx = { maxStars: 100, maxForks: 50, maxWatchers: 20 }

describe('repoSizeScore', () => {
  it('scores a more popular repo higher', () => {
    const popular = repoSizeScore(
      { stars: 100, forksCount: 50, watchersCount: 20 },
      ctx,
    )
    const quiet = repoSizeScore({ stars: 1 }, ctx)
    expect(popular).toBeGreaterThan(quiet)
  })
})
