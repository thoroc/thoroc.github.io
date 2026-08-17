import { afterEach, describe, expect, it } from 'bun:test'
import { GALAXY } from '../constants'
import { buildLanguageLayout } from '../repo-position'
import {
  buildTopicRingKeySet,
  expandReposToVirtualStars,
} from '../virtual-stars'
import { buildStructuredVirtualPositions } from './buildStructuredVirtualPositions'
import { finalizeGalaxyMotion } from './finalizeGalaxyMotion'
import type { RepoLike } from './types'

const repos: RepoLike[] = [
  { id: 'a', fullName: 'owner/a', language: 'Rust', topics: ['cli'] },
  { id: 'b', fullName: 'owner/b', language: 'Python' },
]

describe('finalizeGalaxyMotion', () => {
  const originalEnabled = GALAXY.TOPIC_RINGS_ENABLED

  afterEach(() => {
    GALAXY.TOPIC_RINGS_ENABLED = originalEnabled
  })

  it('returns motion fields sized for the virtual star count', () => {
    const virtualStars = expandReposToVirtualStars(repos)
    const layout = buildLanguageLayout(repos)
    const ringKeys = buildTopicRingKeySet(virtualStars, layout)
    const count = virtualStars.length
    const { positions, harmonizeMeta } = buildStructuredVirtualPositions(
      repos,
      virtualStars,
      layout,
      ringKeys,
    )
    const sizes = new Float32Array(count).fill(1)
    const brights = new Float32Array(count).fill(0.5)
    const ringStarFlags = new Float32Array(count)

    const motion = finalizeGalaxyMotion(
      virtualStars,
      layout,
      ringKeys,
      sizes,
      brights,
      count,
      ringStarFlags,
      positions,
      harmonizeMeta,
      undefined,
      undefined,
    )

    expect(motion.galaxyHubs.length).toBe(count * 3)
    expect(motion.motionOmega.length).toBe(count * 4)
  })

  it('boosts topic-ring stars when TOPIC_RINGS_ENABLED is true', () => {
    GALAXY.TOPIC_RINGS_ENABLED = true
    const virtualStars = expandReposToVirtualStars(repos)
    const layout = buildLanguageLayout(repos)
    const ringKeys = new Set(['Rust\0cli'])
    const count = virtualStars.length
    const { positions, harmonizeMeta } = buildStructuredVirtualPositions(
      repos,
      virtualStars,
      layout,
      ringKeys,
    )
    const sizes = new Float32Array(count).fill(1)
    const brights = new Float32Array(count).fill(0.5)
    const ringStarFlags = new Float32Array(count)

    finalizeGalaxyMotion(
      virtualStars,
      layout,
      ringKeys,
      sizes,
      brights,
      count,
      ringStarFlags,
      positions,
      harmonizeMeta,
      undefined,
      undefined,
    )

    expect(sizes[0]).toBeGreaterThanOrEqual(1)
  })
})
