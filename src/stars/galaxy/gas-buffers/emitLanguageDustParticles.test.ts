import { describe, expect, it } from 'bun:test'
import { emitLanguageDustParticles } from './emitLanguageDustParticles'
import type { DustBuffers, LanguageEmitCtx } from './types'

const makeBuffers = (count: number): DustBuffers => ({
  positions: new Float32Array(count * 3),
  colors: new Float32Array(count * 3),
  sizes: new Float32Array(count),
  density: new Float32Array(count),
})

const ctx: Pick<
  LanguageEmitCtx,
  'hubs' | 'layout' | 'total' | 'sf' | 'perGalaxy'
> = {
  hubs: new Map([['TypeScript', [1, 2, 3]]]),
  layout: { spreadFactor: 1 },
  total: 10,
  sf: 1,
  perGalaxy: 2,
}

describe('emitLanguageDustParticles', () => {
  it('emits perGalaxy dust particles and advances the offset', () => {
    const buffers = makeBuffers(2)
    const o = emitLanguageDustParticles('TypeScript', ctx, buffers, 0)
    expect(o).toBe(2)
    expect(buffers.density[0]).toBeGreaterThan(0)
  })

  it('falls back to the origin hub when the language has no hub', () => {
    const buffers = makeBuffers(2)
    const o = emitLanguageDustParticles('UnknownLang', ctx, buffers, 0)
    expect(o).toBe(2)
  })
})
