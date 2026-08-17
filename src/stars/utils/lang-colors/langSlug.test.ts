import { describe, expect, it } from 'bun:test'
import { langSlug } from './langSlug'

describe('langSlug', () => {
  it('returns "other" for a falsy name', () => {
    expect(langSlug(null)).toBe('other')
    expect(langSlug(undefined)).toBe('other')
    expect(langSlug('')).toBe('other')
  })

  it('replaces + with plus and spaces with hyphens, lowercased', () => {
    expect(langSlug('C++')).toBe('cplusplus')
    expect(langSlug('Objective C')).toBe('objective-c')
  })

  it('lowercases simple names', () => {
    expect(langSlug('TypeScript')).toBe('typescript')
  })
})
