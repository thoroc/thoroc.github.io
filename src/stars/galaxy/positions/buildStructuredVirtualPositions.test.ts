import { describe, expect, it } from 'bun:test'
import { buildLanguageLayout } from '../repo-position'
import {
  buildTopicRingKeySet,
  expandReposToVirtualStars,
} from '../virtual-stars'
import { buildStructuredVirtualPositions } from './buildStructuredVirtualPositions'
import type { RepoLike } from './types'

const repos: RepoLike[] = [
  { id: 'a', fullName: 'owner/a', language: 'Rust', topics: ['cli'] },
  { id: 'b', fullName: 'owner/b', language: 'Python' },
]

describe('buildStructuredVirtualPositions', () => {
  it('returns one position triple per virtual star', () => {
    const virtualStars = expandReposToVirtualStars(repos)
    const layout = buildLanguageLayout(repos)
    const ringKeys = buildTopicRingKeySet(virtualStars, layout)

    const { positions } = buildStructuredVirtualPositions(
      repos,
      virtualStars,
      layout,
      ringKeys,
    )

    expect(positions.length).toBe(virtualStars.length * 3)
    for (const value of positions) {
      expect(Number.isFinite(value)).toBe(true)
    }
  })

  it('returns a harmonizeMeta object for a non-empty star set', () => {
    const virtualStars = expandReposToVirtualStars(repos)
    const layout = buildLanguageLayout(repos)
    const ringKeys = buildTopicRingKeySet(virtualStars, layout)

    const { harmonizeMeta } = buildStructuredVirtualPositions(
      repos,
      virtualStars,
      layout,
      ringKeys,
    )
    expect(harmonizeMeta).not.toBeNull()
  })

  it('folds gas/gasDust buffer extents into the harmonization span', () => {
    const virtualStars = expandReposToVirtualStars(repos)
    const layout = buildLanguageLayout(repos)
    const ringKeys = buildTopicRingKeySet(virtualStars, layout)

    const gasBuffers = {
      positions: new Float32Array([500, 0, 0]),
      count: 1,
    } as unknown as Parameters<typeof buildStructuredVirtualPositions>[4]
    const gasDustBuffers = {
      positions: new Float32Array([0, 500, 0]),
      count: 1,
    } as unknown as Parameters<typeof buildStructuredVirtualPositions>[6]

    expect(() =>
      buildStructuredVirtualPositions(
        repos,
        virtualStars,
        layout,
        ringKeys,
        gasBuffers,
        null,
        gasDustBuffers,
      ),
    ).not.toThrow()
  })
})
