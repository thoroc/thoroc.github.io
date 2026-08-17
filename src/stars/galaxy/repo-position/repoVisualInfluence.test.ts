import { describe, expect, it } from 'bun:test'
import { repoVisualInfluence } from './repoVisualInfluence'

const ctx = { maxStars: 100, maxForks: 50, maxWatchers: 20 }

describe('repoVisualInfluence', () => {
  it('returns a higher score for a more active, popular repo', () => {
    const active = repoVisualInfluence(
      {
        stars: 100,
        forksCount: 50,
        watchersCount: 20,
        pushedAt: new Date().toISOString(),
      },
      ctx,
    )
    const quiet = repoVisualInfluence({ stars: 1, pushedAt: '2000-01-01' }, ctx)
    expect(active).toBeGreaterThan(quiet)
  })
})
