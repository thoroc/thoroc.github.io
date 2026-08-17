import { describe, expect, it } from 'bun:test'
import { repoBrightness } from './repoBrightness'

const ctx = { maxStars: 100, maxForks: 50, maxWatchers: 20 }

describe('repoBrightness', () => {
  it('returns a brighter score for a more active repo', () => {
    const active = repoBrightness(
      { stars: 100, pushedAt: new Date().toISOString() },
      ctx,
    )
    const quiet = repoBrightness({ stars: 1, pushedAt: '2000-01-01' }, ctx)
    expect(active).toBeGreaterThan(quiet)
  })
})
