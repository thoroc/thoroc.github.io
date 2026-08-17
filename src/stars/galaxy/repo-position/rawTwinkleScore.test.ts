import { describe, expect, it } from 'bun:test'
import { rawTwinkleScore } from './rawTwinkleScore'

const ctx = { maxStars: 100, maxForks: 50, maxWatchers: 20 }

describe('rawTwinkleScore', () => {
  it('scores a more active repo higher', () => {
    const active = rawTwinkleScore(
      { stars: 100, pushedAt: new Date().toISOString() },
      ctx,
    )
    const quiet = rawTwinkleScore({ stars: 1, pushedAt: '2000-01-01' }, ctx)
    expect(active).toBeGreaterThan(quiet)
  })
})
