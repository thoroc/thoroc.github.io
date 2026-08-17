import { describe, expect, it } from 'bun:test'
import { placeRingGroup } from './placeRingGroup'
import type { VirtualStar } from './types'

const makeStars = (n: number): VirtualStar[] =>
  Array.from({ length: n }, (_, i) => ({
    repoId: `r${i}`,
    item: {},
    language: 'Rust',
    topic: 'cli',
    virtualKey: `r${i}\0cli`,
  }))

describe('placeRingGroup', () => {
  it('does nothing for an empty index list', () => {
    const positions = new Float32Array([1, 2, 3])
    placeRingGroup([], [], positions, 0, 0, 0, 10, 'k')
    expect(positions).toEqual(new Float32Array([1, 2, 3]))
  })

  it('places every indexed star at a finite position near the group center', () => {
    const stars = makeStars(5)
    const positions = new Float32Array(15)
    const indices = [0, 1, 2, 3, 4]
    placeRingGroup(stars, indices, positions, 100, 0, 0, 10, 'ring-a')

    for (let i = 0; i < 5; i += 1) {
      expect(Number.isFinite(positions[i * 3])).toBe(true)
      expect(Number.isFinite(positions[i * 3 + 1])).toBe(true)
      expect(Number.isFinite(positions[i * 3 + 2])).toBe(true)
    }
  })

  it('marks on-ring stars with flag 1 and overflow stars with flag 0', () => {
    const stars = makeStars(80)
    const positions = new Float32Array(80 * 3)
    const indices = stars.map((_, i) => i)
    const flags = new Float32Array(80)
    placeRingGroup(
      stars,
      indices,
      positions,
      0,
      0,
      0,
      10,
      'ring-b',
      0,
      null,
      flags,
    )

    const onRing = Array.from(flags).filter((f) => f === 1).length
    const overflow = Array.from(flags).filter((f) => f === 0).length
    expect(onRing).toBeGreaterThan(0)
    expect(overflow).toBeGreaterThan(0)
    expect(onRing + overflow).toBe(80)
  })

  it('clamps the ring radius when maxRingR is provided', () => {
    const stars = makeStars(3)
    const positionsUnclamped = new Float32Array(9)
    const positionsClamped = new Float32Array(9)
    const indices = [0, 1, 2]
    placeRingGroup(stars, indices, positionsUnclamped, 0, 0, 0, 50, 'ring-c')
    placeRingGroup(
      stars,
      indices,
      positionsClamped,
      0,
      0,
      0,
      50,
      'ring-c',
      0,
      1,
    )

    const dist = (p: Float32Array, i: number) =>
      Math.hypot(p[i * 3] as number, p[i * 3 + 2] as number)
    expect(dist(positionsClamped, 0)).toBeLessThan(dist(positionsUnclamped, 0))
  })

  it('is deterministic for a given ringKey', () => {
    const stars = makeStars(3)
    const positionsA = new Float32Array(9)
    const positionsB = new Float32Array(9)
    const indices = [0, 1, 2]
    placeRingGroup(stars, indices, positionsA, 5, 5, 5, 10, 'ring-d')
    placeRingGroup(stars, indices, positionsB, 5, 5, 5, 10, 'ring-d')
    expect(positionsA).toEqual(positionsB)
  })
})
