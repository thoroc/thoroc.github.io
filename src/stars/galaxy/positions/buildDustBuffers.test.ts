import { describe, expect, it } from 'bun:test'
import { buildDustBuffers } from './buildDustBuffers'

describe('buildDustBuffers', () => {
  it('returns positions/sizes arrays sized for the default count', () => {
    const { positions, sizes } = buildDustBuffers()
    expect(positions.length).toBe(1600 * 3)
    expect(sizes.length).toBe(1600)
  })

  it('respects a custom count', () => {
    const { positions, sizes } = buildDustBuffers(10)
    expect(positions.length).toBe(30)
    expect(sizes.length).toBe(10)
  })

  it('is deterministic across calls', () => {
    const a = buildDustBuffers(5)
    const b = buildDustBuffers(5)
    expect(a.positions).toEqual(b.positions)
    expect(a.sizes).toEqual(b.sizes)
  })

  it('produces finite, non-negative sizes', () => {
    const { sizes } = buildDustBuffers(20)
    for (const s of sizes) {
      expect(Number.isFinite(s)).toBe(true)
      expect(s).toBeGreaterThan(0)
    }
  })
})
