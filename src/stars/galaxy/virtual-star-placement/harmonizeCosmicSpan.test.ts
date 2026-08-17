import { describe, expect, it } from 'bun:test'
import { harmonizeCosmicSpan } from './harmonizeCosmicSpan'

describe('harmonizeCosmicSpan', () => {
  it('returns null for a non-positive count', () => {
    expect(harmonizeCosmicSpan(new Float32Array(0), 0)).toBeNull()
  })

  it('centers and scales the positions around the origin', () => {
    const positions = new Float32Array([10, 0, 0, -10, 0, 0])
    const meta = harmonizeCosmicSpan(positions, 2)
    expect(meta).not.toBeNull()
    expect(meta?.cx).toBeCloseTo(0, 5)
  })

  it('applies the same scale to auxiliary buffers', () => {
    const positions = new Float32Array([10, 0, 0, -10, 0, 0])
    const aux = new Float32Array([5, 0, 0])
    harmonizeCosmicSpan(positions, 2, [{ buf: aux, n: 1 }])
    expect(Number.isFinite(aux[0])).toBe(true)
  })

  it('skips empty or zero-length auxiliary buffers', () => {
    const positions = new Float32Array([10, 0, 0, -10, 0, 0])
    expect(() =>
      harmonizeCosmicSpan(positions, 2, [
        { buf: new Float32Array(0), n: 0 },
        null as unknown as { buf: Float32Array; n: number },
      ]),
    ).not.toThrow()
  })
})
