import { describe, expect, it } from 'bun:test'
import { buildKnowledgeMessage } from './surface-knowledge-base'

describe('buildKnowledgeMessage', () => {
  const line = (domain: string) => JSON.stringify({ domain })

  it('returns undefined for empty or unparseable input', () => {
    expect(buildKnowledgeMessage([], 'project-kb')).toBeUndefined()
    expect(buildKnowledgeMessage(['not json'], 'project-kb')).toBeUndefined()
  })

  it('summarises total count and domains', () => {
    const message = buildKnowledgeMessage(
      [line('aws'), line('aws'), line('ts')],
      'project-kb',
    )
    expect(message).toContain('3 articles across domains: aws (2), ts (1)')
  })

  it('mentions the qmd collection for searching', () => {
    const message = buildKnowledgeMessage([line('aws')], 'my-collection')
    expect(message).toContain('`qmd query` (collection `my-collection`)')
  })

  it('falls back to unknown domain when missing', () => {
    const message = buildKnowledgeMessage([JSON.stringify({})], 'project-kb')
    expect(message).toContain('unknown (1)')
  })
})
