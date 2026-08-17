import { describe, expect, it } from 'bun:test'
import { emitLanguageGasParticles } from './emitLanguageGasParticles'
import type { GasBuffers, LanguageEmitCtx } from './types'

const makeBuffers = (count: number): GasBuffers => ({
  positions: new Float32Array(count * 3),
  colors: new Float32Array(count * 3),
  sizes: new Float32Array(count),
  phases: new Float32Array(count),
  softness: new Float32Array(count),
  density: new Float32Array(count),
  stretch: new Float32Array(count),
})

const ctx: LanguageEmitCtx = {
  hubs: new Map([['TypeScript', [1, 2, 3]]]),
  layout: { spreadFactor: 1 },
  total: 10,
  sf: 1,
  perGalaxy: 2,
  corePerGalaxy: 1,
}

describe('emitLanguageGasParticles', () => {
  it('emits perGalaxy + corePerGalaxy particles and returns the galaxy radius', () => {
    const buffers = makeBuffers(3)
    const { o, gR } = emitLanguageGasParticles('TypeScript', ctx, buffers, 0)
    expect(o).toBe(3)
    expect(gR).toBeGreaterThan(0)
    expect(buffers.density[0]).toBeGreaterThan(0)
    expect(buffers.density[2]).toBeGreaterThan(0)
  })

  it('falls back to the origin hub when the language has no hub', () => {
    const buffers = makeBuffers(3)
    const result = emitLanguageGasParticles('UnknownLang', ctx, buffers, 0)
    expect(result.o).toBe(3)
  })
})
