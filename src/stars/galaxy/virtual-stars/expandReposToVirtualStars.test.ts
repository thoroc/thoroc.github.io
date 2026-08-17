import { describe, expect, it } from 'bun:test'
import { expandReposToVirtualStars } from './expandReposToVirtualStars'
import type { RepoLike } from './types'

describe('expandReposToVirtualStars', () => {
  it('returns an empty array for null/undefined input', () => {
    expect(expandReposToVirtualStars(null)).toEqual([])
    expect(expandReposToVirtualStars(undefined)).toEqual([])
  })

  it('skips repos without an id or fullName', () => {
    const repos = [{ language: 'Rust' }] as unknown as RepoLike[]
    expect(expandReposToVirtualStars(repos)).toEqual([])
  })

  it('creates one placeholder virtual star for a repo without topics', () => {
    const repo = { id: 'r1', language: 'Rust' } as unknown as RepoLike
    const stars = expandReposToVirtualStars([repo])
    expect(stars).toEqual([
      {
        repoId: 'r1',
        item: repo,
        language: 'Rust',
        topic: null,
        virtualKey: 'r1\0',
      },
    ])
  })

  it('creates one virtual star per topic', () => {
    const repos = [
      { id: 'r1', language: 'Rust', topics: ['cli', 'async'] },
    ] as unknown as RepoLike[]
    const stars = expandReposToVirtualStars(repos)
    expect(stars).toHaveLength(2)
    expect(stars.map((s) => s.virtualKey)).toEqual(['r1\0cli', 'r1\0async'])
  })

  it('falls back to fullName when id is absent, and defaults language', () => {
    const repos = [{ fullName: 'owner/repo' }] as unknown as RepoLike[]
    const stars = expandReposToVirtualStars(repos)
    expect(stars[0]?.repoId).toBe('owner/repo')
    expect(stars[0]?.language).toBe('其他')
  })
})
