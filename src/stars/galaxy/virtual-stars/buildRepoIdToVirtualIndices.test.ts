import { describe, expect, it } from 'bun:test'
import { buildRepoIdToVirtualIndices } from './buildRepoIdToVirtualIndices'
import type { VirtualStar } from './types'

const makeStar = (repoId: string, virtualKey: string): VirtualStar => ({
  repoId,
  item: {},
  language: 'Rust',
  topic: null,
  virtualKey,
})

describe('buildRepoIdToVirtualIndices', () => {
  it('groups virtual star indices by repoId', () => {
    const stars = [
      makeStar('r1', 'r1\0a'),
      makeStar('r2', 'r2\0'),
      makeStar('r1', 'r1\0b'),
    ]
    const map = buildRepoIdToVirtualIndices(stars)
    expect(map.get('r1')).toEqual([0, 2])
    expect(map.get('r2')).toEqual([1])
  })

  it('returns an empty map for an empty input', () => {
    expect(buildRepoIdToVirtualIndices([]).size).toBe(0)
  })
})
