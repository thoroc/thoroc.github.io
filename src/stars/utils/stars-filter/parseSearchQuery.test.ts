import { describe, expect, it } from 'bun:test'
import { parseSearchQuery } from './parseSearchQuery'

describe('parseSearchQuery', () => {
  it('returns empty text and topics for a blank query', () => {
    expect(parseSearchQuery('')).toEqual({ text: '', topics: [] })
    expect(parseSearchQuery('   ')).toEqual({ text: '', topics: [] })
  })

  it('extracts a single topic tag and strips it from the text', () => {
    expect(parseSearchQuery('#vue')).toEqual({ text: '', topics: ['vue'] })
  })

  it('extracts multiple topic tags and preserves remaining text', () => {
    expect(parseSearchQuery('vite #electron #cli')).toEqual({
      text: 'vite',
      topics: ['electron', 'cli'],
    })
  })

  it('deduplicates repeated topic tags', () => {
    expect(parseSearchQuery('#vue #vue')).toEqual({
      text: '',
      topics: ['vue'],
    })
  })

  it('lowercases topic tags', () => {
    expect(parseSearchQuery('#Vue')).toEqual({ text: '', topics: ['vue'] })
  })
})
