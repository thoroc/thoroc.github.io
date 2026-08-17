import { describe, expect, it } from 'bun:test'
import { buildStarVisualBuffers } from './buildStarVisualBuffers'
import type { VirtualStar } from './types'

const makeStar = (repoId: string, language: string): VirtualStar => ({
  repoId,
  item: {
    language,
    stars: 10,
    forksCount: 2,
    watchersCount: 3,
    pushedAt: '2026-01-01',
  },
  language,
  topic: null,
  virtualKey: `${repoId}\0`,
})

const ctx = { maxStars: 100, maxForks: 20, maxWatchers: 10 }

describe('buildStarVisualBuffers', () => {
  it('fills one color/bright/activity/seed entry per virtual star', () => {
    const stars = [makeStar('a', 'Rust'), makeStar('b', 'Python')]
    const sizes = new Float32Array([1, 1])
    const result = buildStarVisualBuffers(stars, ctx, sizes, -1, new Map())

    expect(result.colors.length).toBe(6)
    expect(result.brights.length).toBe(2)
    expect(result.activities.length).toBe(2)
    expect(result.seeds.length).toBe(2)
    expect(result.idToIndex.get('a')).toBe(0)
    expect(result.idToIndex.get('b')).toBe(1)
  })

  it('applies an extra boost to the anchor star', () => {
    const stars = [makeStar('a', 'Rust')]
    const sizesBoosted = new Float32Array([1])
    const sizesPlain = new Float32Array([1])

    buildStarVisualBuffers(stars, ctx, sizesBoosted, 0, new Map())
    buildStarVisualBuffers(stars, ctx, sizesPlain, -1, new Map())

    expect(sizesBoosted[0]).toBeCloseTo(1.4)
    expect(sizesPlain[0]).toBe(1)
  })

  it('reads activity from the repoActivityById map, defaulting to 0', () => {
    const stars = [makeStar('a', 'Rust'), makeStar('b', 'Python')]
    const sizes = new Float32Array([1, 1])
    const activityMap = new Map([['a', 0.75]])
    const result = buildStarVisualBuffers(stars, ctx, sizes, -1, activityMap)

    expect(result.activities[0]).toBe(0.75)
    expect(result.activities[1]).toBe(0)
  })

  it('keeps the first index for a repeated repoId', () => {
    const stars = [makeStar('a', 'Rust'), makeStar('a', 'Rust')]
    const sizes = new Float32Array([1, 1])
    const result = buildStarVisualBuffers(stars, ctx, sizes, -1, new Map())
    expect(result.idToIndex.get('a')).toBe(0)
  })
})
