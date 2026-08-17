import { describe, expect, it } from 'bun:test'
import { buildGasClumpField } from './buildGasClumpField'
import { sampleGasDustParticle } from './sampleGasDustParticle'

describe('sampleGasDustParticle', () => {
  it('samples a finite world-space dust particle', () => {
    const field = buildGasClumpField('Rust', 80)
    const particle = sampleGasDustParticle(1, field)
    expect(Number.isFinite(particle.lx)).toBe(true)
    expect(Number.isFinite(particle.ly)).toBe(true)
    expect(Number.isFinite(particle.lz)).toBe(true)
    expect(particle.density).toBeGreaterThanOrEqual(0.48)
  })
})
