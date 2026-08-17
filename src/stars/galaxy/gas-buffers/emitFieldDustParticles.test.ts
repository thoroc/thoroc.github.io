import { describe, expect, it } from 'bun:test'
import { emitFieldDustParticles } from './emitFieldDustParticles'
import type { DustBuffers, GasField } from './types'

const makeBuffers = (count: number): DustBuffers => ({
  positions: new Float32Array(count * 3),
  colors: new Float32Array(count * 3),
  sizes: new Float32Array(count),
  density: new Float32Array(count),
})

const field: GasField = {
  kernels: new Map([['k1', { lang: 'Rust' }]]),
  span: 60,
  coreR: 8,
}

describe('emitFieldDustParticles', () => {
  it('writes the requested number of dust particles and advances the offset', () => {
    const buffers = makeBuffers(2)
    const o = emitFieldDustParticles(field, 1, 2, buffers, 0)
    expect(o).toBe(2)
    expect(buffers.density[0]).toBeGreaterThan(0)
  })

  it('falls back to the default language when a kernel has none', () => {
    const emptyField: GasField = {
      kernels: new Map([['k1', {}]]),
      span: 10,
      coreR: 5,
    }
    const buffers = makeBuffers(1)
    const o = emitFieldDustParticles(emptyField, 1, 1, buffers, 0)
    expect(o).toBe(1)
  })

  it('writes nothing when fieldDust is 0', () => {
    const buffers = makeBuffers(0)
    const o = emitFieldDustParticles(field, 1, 0, buffers, 0)
    expect(o).toBe(0)
  })
})
