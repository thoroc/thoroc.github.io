import { describe, expect, it } from 'bun:test'
import { itemTopicKeys } from './itemTopicKeys'
import type { StarItem } from './types'

const baseItem: StarItem = {
  fullName: 'owner/repo',
  language: 'Rust',
  license: 'MIT',
  fork: false,
  stars: 10,
  starredAt: '2026-01-01',
  pushedAt: '2026-01-01',
}

describe('itemTopicKeys', () => {
  it('returns an empty array when topics is missing', () => {
    expect(itemTopicKeys(baseItem)).toEqual([])
  })

  it('lowercases each topic', () => {
    expect(itemTopicKeys({ ...baseItem, topics: ['CLI', 'Async'] })).toEqual([
      'cli',
      'async',
    ])
  })
})
