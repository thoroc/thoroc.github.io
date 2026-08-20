import { describe, expect, it } from 'bun:test'
import { normalizeUiLocale } from './normalizeUiLocale'

describe('normalizeUiLocale', () => {
  it('returns "en" for "en"', () => {
    expect(normalizeUiLocale('en')).toBe('en')
  })

  it('returns "fr" for anything else', () => {
    expect(normalizeUiLocale('fr')).toBe('fr')
    expect(normalizeUiLocale('zh-CN')).toBe('fr')
    expect(normalizeUiLocale(null)).toBe('fr')
    expect(normalizeUiLocale(undefined)).toBe('fr')
  })
})
