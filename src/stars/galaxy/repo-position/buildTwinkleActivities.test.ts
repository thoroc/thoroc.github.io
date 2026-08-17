import { describe, expect, it } from 'bun:test'
import { buildTwinkleActivities } from './buildTwinkleActivities'

const ctx = { maxStars: 100, maxForks: 50, maxWatchers: 20 }

describe('buildTwinkleActivities', () => {
  it('returns an empty buffer for an empty list', () => {
    expect(buildTwinkleActivities([], ctx)).toEqual(new Float32Array(0))
  })

  it('assigns full activity to a single repo', () => {
    expect(buildTwinkleActivities([{ stars: 1 }], ctx)).toEqual(
      new Float32Array([1]),
    )
  })

  it('ranks repos by percentile', () => {
    const activities = buildTwinkleActivities(
      [{ stars: 1 }, { stars: 100 }],
      ctx,
    )
    expect(activities[1]).toBeGreaterThan(activities[0] as number)
  })
})
