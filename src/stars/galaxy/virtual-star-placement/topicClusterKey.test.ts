import { describe, expect, it } from 'bun:test'
import { topicClusterKey } from './topicClusterKey'

const layout = { langKeys: new Set(['TypeScript']) }

describe('topicClusterKey', () => {
  it('returns an empty string when the star has no topic', () => {
    expect(topicClusterKey({ virtualKey: 'v', repoId: 'r' }, layout)).toBe('')
  })

  it('combines the language and topic into a key', () => {
    const key = topicClusterKey(
      { virtualKey: 'v', repoId: 'r', topic: 'cli', language: 'TypeScript' },
      layout,
    )
    expect(key).toBe('TypeScript\0cli')
  })
})
