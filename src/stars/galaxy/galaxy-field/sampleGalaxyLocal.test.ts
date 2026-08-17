import { describe, expect, it } from 'bun:test'
import { sampleGalaxyLocal } from './sampleGalaxyLocal'

describe('sampleGalaxyLocal', () => {
  it('returns a finite local-space position', () => {
    const [x, y, z] = sampleGalaxyLocal(1, 'TypeScript', 10)
    expect(Number.isFinite(x)).toBe(true)
    expect(Number.isFinite(y)).toBe(true)
    expect(Number.isFinite(z)).toBe(true)
  })
})
