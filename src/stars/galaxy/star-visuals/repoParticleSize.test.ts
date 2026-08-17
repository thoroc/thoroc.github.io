import { describe, expect, it } from 'bun:test'
import { repoParticleSize } from './repoParticleSize'

const ctx = { maxStars: 100, maxForks: 50, maxWatchers: 20 }

describe('repoParticleSize', () => {
  it('returns a finite size within the configured range', () => {
    const size = repoParticleSize({ stars: 50 }, ctx)
    expect(Number.isFinite(size)).toBe(true)
  })
})
