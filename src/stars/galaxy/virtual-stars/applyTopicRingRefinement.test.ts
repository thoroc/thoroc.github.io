import { describe, expect, it } from 'bun:test'
import { applyTopicRingRefinement } from './applyTopicRingRefinement'
import type { LayoutLike, VirtualStar } from './types'

const makeLayout = (langs: string[]): LayoutLike =>
  ({
    langKeys: new Set(langs),
    spreadFactor: 1,
  }) as unknown as LayoutLike

const makeStars = (n: number, topic: string | null = 'cli'): VirtualStar[] =>
  Array.from({ length: n }, (_, i) => ({
    repoId: `r${i}`,
    item: {},
    language: 'Rust',
    topic,
    virtualKey: `r${i}\0${topic ?? ''}`,
  }))

describe('applyTopicRingRefinement', () => {
  it('does nothing when virtualStars is empty', () => {
    const positions = new Float32Array([1, 2, 3])
    applyTopicRingRefinement(
      [],
      positions,
      makeLayout(['Rust']),
      new Set(['x']),
    )
    expect(positions).toEqual(new Float32Array([1, 2, 3]))
  })

  it('does nothing when ringKeys is empty', () => {
    const positions = new Float32Array([1, 2, 3])
    applyTopicRingRefinement(
      makeStars(1),
      positions,
      makeLayout(['Rust']),
      new Set(),
    )
    expect(positions).toEqual(new Float32Array([1, 2, 3]))
  })

  it('repositions only stars whose topic ring key is in ringKeys', () => {
    const stars = [...makeStars(3, 'cli'), ...makeStars(2, 'other')]
    const positions = new Float32Array(stars.length * 3).fill(1)
    applyTopicRingRefinement(
      stars,
      positions,
      makeLayout(['Rust']),
      new Set(['Rust\0cli']),
      { totalRepos: stars.length },
    )

    for (let i = 0; i < 3; i += 1) {
      expect(positions[i * 3]).not.toBe(1)
    }
    for (let i = 3; i < 5; i += 1) {
      expect(positions[i * 3]).toBe(1)
    }
  })

  it('pulls the ring group toward a provided hub when it drifts too far', () => {
    const stars = makeStars(4, 'cli')
    const farPositions = new Float32Array([
      1000, 0, 1000, 1000, 0, 1000, 1000, 0, 1000, 1000, 0, 1000,
    ])
    const hubs = new Map<string, [number, number, number]>([
      ['Rust', [0, 0, 0]],
    ])
    applyTopicRingRefinement(
      stars,
      farPositions,
      makeLayout(['Rust']),
      new Set(['Rust\0cli']),
      { totalRepos: 4, hubs },
    )

    const dist = Math.hypot(
      farPositions[0] as number,
      farPositions[2] as number,
    )
    expect(dist).toBeLessThan(1000)
  })
})
