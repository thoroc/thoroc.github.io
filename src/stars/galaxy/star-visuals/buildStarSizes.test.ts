import { describe, expect, it } from 'bun:test'
import { buildStarSizes } from './buildStarSizes'

const ctx = { maxStars: 100, maxForks: 50, maxWatchers: 20 }

describe('buildStarSizes', () => {
  it('returns an empty buffer for an empty list', () => {
    expect(buildStarSizes([], ctx)).toEqual(new Float32Array(0))
  })

  it('sizes a single repo at a fixed fraction of the range', () => {
    const sizes = buildStarSizes([{ stars: 5 }], ctx)
    expect(sizes.length).toBe(1)
    expect(sizes[0]).toBeGreaterThan(0)
  })

  it('ranks repos by size score', () => {
    const sizes = buildStarSizes([{ stars: 1 }, { stars: 100 }], ctx)
    expect(sizes[1]).toBeGreaterThan(sizes[0] as number)
  })
})
