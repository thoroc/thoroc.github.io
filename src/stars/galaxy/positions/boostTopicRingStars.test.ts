import { describe, expect, it } from 'bun:test'
import { buildLanguageLayout } from '../repo-position'
import { boostTopicRingStars } from './boostTopicRingStars'
import type { VirtualStar } from './types'

const makeStar = (
  repoId: string,
  language: string,
  topic: string | null,
): VirtualStar => ({
  repoId,
  item: { language },
  language,
  topic,
  virtualKey: `${repoId}\0${topic ?? ''}`,
})

describe('boostTopicRingStars', () => {
  it('does nothing when ringKeys is empty', () => {
    const stars = [makeStar('a', 'Rust', 'cli')]
    const sizes = new Float32Array([1])
    const brights = new Float32Array([0.5])
    boostTopicRingStars(
      stars,
      buildLanguageLayout([{ language: 'Rust' }]),
      new Set(),
      sizes,
      brights,
      1,
    )
    expect(sizes[0]).toBe(1)
    expect(brights[0]).toBe(0.5)
  })

  it('does nothing when count is 0', () => {
    const sizes = new Float32Array([1])
    const brights = new Float32Array([0.5])
    boostTopicRingStars(
      [],
      buildLanguageLayout([]),
      new Set(['Rust\0cli']),
      sizes,
      brights,
      0,
    )
    expect(sizes[0]).toBe(1)
  })

  it('boosts size/brightness for stars matching an active ring key', () => {
    const stars = [makeStar('a', 'Rust', 'cli')]
    const layout = buildLanguageLayout([{ language: 'Rust' }])
    const sizes = new Float32Array([1])
    const brights = new Float32Array([0.5])
    boostTopicRingStars(
      stars,
      layout,
      new Set(['Rust\0cli']),
      sizes,
      brights,
      1,
    )
    expect(sizes[0]).toBeCloseTo(1.06)
    expect(brights[0]).toBeCloseTo(0.55)
  })

  it('skips stars without a topic', () => {
    const stars = [makeStar('a', 'Rust', null)]
    const layout = buildLanguageLayout([{ language: 'Rust' }])
    const sizes = new Float32Array([1])
    const brights = new Float32Array([0.5])
    boostTopicRingStars(
      stars,
      layout,
      new Set(['Rust\0cli']),
      sizes,
      brights,
      1,
    )
    expect(sizes[0]).toBe(1)
  })

  it('respects ringStarFlags, skipping flagged-out stars', () => {
    const stars = [makeStar('a', 'Rust', 'cli')]
    const layout = buildLanguageLayout([{ language: 'Rust' }])
    const sizes = new Float32Array([1])
    const brights = new Float32Array([0.5])
    const flags = new Float32Array([0])
    boostTopicRingStars(
      stars,
      layout,
      new Set(['Rust\0cli']),
      sizes,
      brights,
      1,
      flags,
    )
    expect(sizes[0]).toBe(1)
  })
})
