import { describe, expect, it } from 'bun:test'
import { buildLanguageLayout } from './buildLanguageLayout'
import { topicAngleOffset } from './topicAngleOffset'

describe('topicAngleOffset', () => {
  it('returns a finite angular offset', () => {
    const layout = buildLanguageLayout([{ language: 'TypeScript' }])
    const offset = topicAngleOffset(
      { language: 'TypeScript', topics: ['cli'] },
      layout,
    )
    expect(Number.isFinite(offset)).toBe(true)
  })
})
