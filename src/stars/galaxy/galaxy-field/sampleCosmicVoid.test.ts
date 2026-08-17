import { describe, expect, it } from 'bun:test'
import { sampleCosmicVoid } from './sampleCosmicVoid'

describe('sampleCosmicVoid', () => {
  it('returns a finite world-space position', () => {
    const [x, y, z] = sampleCosmicVoid(1, 100)
    expect(Number.isFinite(x)).toBe(true)
    expect(Number.isFinite(y)).toBe(true)
    expect(Number.isFinite(z)).toBe(true)
  })
})
