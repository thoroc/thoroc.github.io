import { describe, expect, test } from 'bun:test'
import { findAnchorRepoId } from './force-similarity'

describe('findAnchorRepoId', () => {
  test('returns null for an empty list', () => {
    expect(findAnchorRepoId([])).toBeNull()
  })

  test('picks the item with the earliest starredAt', () => {
    const items = [
      { id: 'b', starredAt: '2024-01-01T00:00:00Z' },
      { id: 'a', starredAt: '2020-01-01T00:00:00Z' },
      { id: 'c', starredAt: '2023-01-01T00:00:00Z' },
    ]
    expect(findAnchorRepoId(items)).toBe('a')
  })

  test('ignores items with unparsable starredAt', () => {
    const items = [
      { id: 'bad', starredAt: 'not-a-date' },
      { id: 'good', starredAt: '2021-01-01T00:00:00Z' },
    ]
    expect(findAnchorRepoId(items)).toBe('good')
  })

  test('falls back to the first item when every starredAt is unparsable', () => {
    const items = [
      { id: 'a', starredAt: 'nope' },
      { id: 'b', starredAt: 'also-nope' },
    ]
    expect(findAnchorRepoId(items)).toBe('a')
  })
})
