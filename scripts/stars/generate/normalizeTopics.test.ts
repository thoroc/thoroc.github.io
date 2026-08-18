import { describe, expect, it } from 'bun:test'
import { normalizeTopics } from './normalizeTopics'

describe('normalizeTopics', () => {
  it('returns an empty array when topics is missing or not an array', () => {
    expect(normalizeTopics({ full_name: 'o/r' })).toEqual([])
  })

  it('trims and filters out blank/non-string entries', () => {
    expect(
      normalizeTopics({
        full_name: 'o/r',
        topics: [' cli ', '', '   ', 'vue'],
      }),
    ).toEqual(['cli', 'vue'])
  })
})
