import { describe, expect, it } from 'bun:test'
import { buildGalaxyBuffers } from './buildGalaxyBuffers'
import type { RepoLike } from './types'

const repos: RepoLike[] = [
  {
    id: 'a',
    fullName: 'owner/a',
    language: 'Rust',
    topics: ['cli'],
    stars: 100,
    forksCount: 10,
    watchersCount: 5,
    pushedAt: '2026-01-01',
    starredAt: '2026-01-01',
  },
  {
    id: 'b',
    fullName: 'owner/b',
    language: 'Python',
    stars: 50,
    forksCount: 5,
    watchersCount: 2,
    pushedAt: '2025-06-01',
    starredAt: '2025-01-01',
  },
]

describe('buildGalaxyBuffers', () => {
  it('returns empty buffers for a null/undefined item list', () => {
    const buffers = buildGalaxyBuffers(null)
    expect(buffers.count).toBe(0)
    expect(buffers.positions.length).toBe(0)
  })

  it('builds one entry per virtual star with all buffers sized to match', () => {
    const buffers = buildGalaxyBuffers(repos)
    expect(buffers.count).toBe(2)
    expect(buffers.positions.length).toBe(6)
    expect(buffers.colors.length).toBe(6)
    expect(buffers.sizes.length).toBe(2)
    expect(buffers.brights.length).toBe(2)
    expect(buffers.activities.length).toBe(2)
    expect(buffers.seeds.length).toBe(2)
    expect(buffers.items).toHaveLength(2)
    expect(buffers.virtualStars).toHaveLength(2)
  })

  it('includes a legend and star-tier breakdown', () => {
    const buffers = buildGalaxyBuffers(repos)
    expect(buffers.legend.length).toBeGreaterThan(0)
    expect(buffers.starTiers.length).toBeGreaterThan(0)
  })

  it('produces motion fields sized to the virtual star count', () => {
    const buffers = buildGalaxyBuffers(repos)
    expect(buffers.motion.galaxyHubs.length).toBe(buffers.count * 3)
  })

  it('maps each repoId to its virtual star indices', () => {
    const buffers = buildGalaxyBuffers(repos)
    expect(buffers.repoIdToIndices.get('a')).toEqual([0])
    expect(buffers.repoIdToIndices.get('b')).toEqual([1])
  })

  it('is deterministic across calls with the same input', () => {
    const a = buildGalaxyBuffers(repos)
    const b = buildGalaxyBuffers(repos)
    expect(a.positions).toEqual(b.positions)
    expect(a.colors).toEqual(b.colors)
  })
})
