import { describe, expect, it } from 'bun:test'
import { primaryTopic } from './primaryTopic'

describe('primaryTopic', () => {
  it('returns the lowercased first topic', () => {
    expect(primaryTopic({ topics: ['CLI', 'tools'] })).toBe('cli')
  })

  it('returns an empty string when there are no topics', () => {
    expect(primaryTopic({})).toBe('')
    expect(primaryTopic({ topics: [] })).toBe('')
  })
})
