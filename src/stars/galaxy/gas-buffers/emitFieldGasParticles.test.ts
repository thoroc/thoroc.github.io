import { describe, expect, it } from 'bun:test'
import { emitFieldGasParticles } from './emitFieldGasParticles'
import type { GasBuffers, GasField } from './types'

const makeBuffers = (count: number): GasBuffers => ({
  positions: new Float32Array(count * 3),
  colors: new Float32Array(count * 3),
  sizes: new Float32Array(count),
  phases: new Float32Array(count),
  softness: new Float32Array(count),
  density: new Float32Array(count),
  stretch: new Float32Array(count),
})

const field: GasField = {
  kernels: new Map([['k1', { lang: 'TypeScript' }]]),
  span: 100,
  coreR: 10,
}

describe('emitFieldGasParticles', () => {
  it('writes the requested number of particles and advances the offset', () => {
    const buffers = makeBuffers(3)
    const { o, coreR } = emitFieldGasParticles(field, 1, 3, buffers, 0)
    expect(o).toBe(3)
    expect(coreR).toBe(10)
    expect(buffers.density[0]).toBeGreaterThan(0)
  })

  it('falls back to the default language when a kernel has none', () => {
    const emptyField: GasField = {
      kernels: new Map([['k1', {}]]),
      span: 10,
      coreR: 5,
    }
    const buffers = makeBuffers(1)
    const { o } = emitFieldGasParticles(emptyField, 1, 1, buffers, 0)
    expect(o).toBe(1)
  })

  it('writes nothing when fieldGas is 0', () => {
    const buffers = makeBuffers(0)
    const { o } = emitFieldGasParticles(field, 1, 0, buffers, 0)
    expect(o).toBe(0)
  })
})
