import { describe, expect, it } from 'bun:test'
import { topicRingKey } from './topicRingKey'

describe('topicRingKey', () => {
  it('joins language and topic with a NUL separator', () => {
    expect(topicRingKey('Rust', 'cli')).toBe('Rust\0cli')
  })
})
