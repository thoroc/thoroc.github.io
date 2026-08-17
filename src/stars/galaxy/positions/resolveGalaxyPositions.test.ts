import { describe, expect, it } from 'bun:test'
import { GALAXY_LAYOUT_VERSION } from '../layout-payload'
import { buildLanguageLayout } from '../repo-position'
import {
  buildTopicRingKeySet,
  expandReposToVirtualStars,
} from '../virtual-stars'
import { resolveGalaxyPositions } from './resolveGalaxyPositions'
import type { RepoLike } from './types'

const repos: RepoLike[] = [
  { id: 'a', fullName: 'owner/a', language: 'Rust', starredAt: '2026-01-01' },
  { id: 'b', fullName: 'owner/b', language: 'Python', starredAt: '2025-01-01' },
]

describe('resolveGalaxyPositions', () => {
  it('runs the structured pipeline when no galaxyCtx is provided', () => {
    const virtualStars = expandReposToVirtualStars(repos)
    const layout = buildLanguageLayout(repos)
    const ringKeys = buildTopicRingKeySet(virtualStars, layout)
    const ringStarFlags = new Float32Array(virtualStars.length)

    const result = resolveGalaxyPositions(
      repos,
      virtualStars,
      layout,
      ringKeys,
      undefined,
      ringStarFlags,
      undefined,
      null,
    )

    expect(result.positions.length).toBe(virtualStars.length * 3)
    expect(result.harmonizeMeta).not.toBeNull()
  })

  it('locates the anchor index by repoId when an anchor repo exists', () => {
    const virtualStars = expandReposToVirtualStars(repos)
    const layout = buildLanguageLayout(repos)
    const ringKeys = buildTopicRingKeySet(virtualStars, layout)
    const ringStarFlags = new Float32Array(virtualStars.length)

    const result = resolveGalaxyPositions(
      repos,
      virtualStars,
      layout,
      ringKeys,
      undefined,
      ringStarFlags,
      undefined,
      null,
    )

    expect(result.anchorIndex).toBeGreaterThanOrEqual(0)
  })

  it('reuses a valid precomputed layout instead of recomputing', () => {
    const virtualStars = expandReposToVirtualStars(repos)
    const layout = buildLanguageLayout(repos)
    const ringKeys = buildTopicRingKeySet(virtualStars, layout)
    const ringStarFlags = new Float32Array(virtualStars.length)

    const virtualIndexMap = new Map(
      virtualStars.map((v, i) => [v.virtualKey, i]),
    )
    const galaxyCtx = {
      layout: {
        version: GALAXY_LAYOUT_VERSION,
        anchorId: 'a',
        positions: virtualStars.flatMap((_, i) => [i, i, i]),
      },
      virtualIndexMap,
    }

    const result = resolveGalaxyPositions(
      repos,
      virtualStars,
      layout,
      ringKeys,
      undefined,
      ringStarFlags,
      undefined,
      galaxyCtx,
    )

    expect(result.harmonizeMeta).toBeNull()
    expect(Array.from(result.positions.slice(0, 3))).toEqual([0, 0, 0])
  })

  it('falls back to the structured pipeline when the precomputed layout is invalid', () => {
    const virtualStars = expandReposToVirtualStars(repos)
    const layout = buildLanguageLayout(repos)
    const ringKeys = buildTopicRingKeySet(virtualStars, layout)
    const ringStarFlags = new Float32Array(virtualStars.length)

    const galaxyCtx = {
      layout: { version: 0, anchorId: null, positions: [] },
      virtualIndexMap: new Map(),
    }

    const result = resolveGalaxyPositions(
      repos,
      virtualStars,
      layout,
      ringKeys,
      undefined,
      ringStarFlags,
      undefined,
      galaxyCtx,
    )

    expect(result.harmonizeMeta).not.toBeNull()
  })
})
