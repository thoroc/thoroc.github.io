import { describe, expect, it } from 'bun:test'
import { normalizeRepoTopics } from './normalizeRepoTopics'
import type { RepoLike } from './types'

describe('normalizeRepoTopics', () => {
  it('returns an empty array when topics is missing or not an array', () => {
    expect(normalizeRepoTopics({} as RepoLike)).toEqual([])
    expect(
      normalizeRepoTopics({ topics: undefined } as unknown as RepoLike),
    ).toEqual([])
  })

  it('lowercases, trims, and dedupes topics', () => {
    const repo = {
      topics: [' Rust ', 'rust', 'CLI', ''],
    } as unknown as RepoLike
    expect(normalizeRepoTopics(repo)).toEqual(['rust', 'cli'])
  })
})
