import { describe, expect, it } from 'bun:test'
import { topicRadialOffset } from './topicRadialOffset'

describe('topicRadialOffset', () => {
  it('returns a finite radial offset', () => {
    const offset = topicRadialOffset({
      id: 'a',
      language: 'TypeScript',
      topics: ['cli'],
    })
    expect(Number.isFinite(offset)).toBe(true)
  })
})
