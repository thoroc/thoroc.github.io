import { describe, expect, it } from 'bun:test'
import { repoTwinkle } from './repoTwinkle'

const ctx = { maxStars: 100, maxForks: 50, maxWatchers: 20 }

describe('repoTwinkle', () => {
  it('clamps the score to 0..1', () => {
    const score = repoTwinkle({ stars: 100 }, ctx)
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(1)
  })
})
