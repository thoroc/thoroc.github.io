import { describe, expect, it } from 'bun:test'
import { buildGasClumpField } from './buildGasClumpField'
import { sampleGasCloudParticle } from './sampleGasCloudParticle'

describe('sampleGasCloudParticle', () => {
  it('samples a finite world-space particle', () => {
    const field = buildGasClumpField('TypeScript', 100)
    for (let h = 1; h <= 20; h += 1) {
      const particle = sampleGasCloudParticle(h, field)
      expect(Number.isFinite(particle.lx)).toBe(true)
      expect(Number.isFinite(particle.ly)).toBe(true)
      expect(Number.isFinite(particle.lz)).toBe(true)
      expect(particle.stretch).toBeGreaterThan(0)
    }
  })
})
