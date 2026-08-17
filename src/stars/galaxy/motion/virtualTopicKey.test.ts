import { describe, expect, it } from 'bun:test'
import { buildLanguageLayout } from '../repo-position'
import { virtualTopicKey } from './virtualTopicKey'

describe('virtualTopicKey', () => {
  it('combines the language and topic', () => {
    const layout = buildLanguageLayout([{ language: 'TypeScript' }])
    const key = virtualTopicKey(
      {
        virtualKey: 'a',
        repoId: 'a',
        item: {},
        language: 'TypeScript',
        topic: 'cli',
      },
      layout,
    )
    expect(key).toBe('TypeScript\0cli')
  })

  it('falls back to __none__ when there is no topic', () => {
    const layout = buildLanguageLayout([{ language: 'TypeScript' }])
    const key = virtualTopicKey(
      {
        virtualKey: 'a',
        repoId: 'a',
        item: {},
        language: 'TypeScript',
        topic: null,
      },
      layout,
    )
    expect(key).toBe('TypeScript\0__none__')
  })
})
