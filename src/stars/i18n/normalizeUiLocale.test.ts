import { describe, expect, it } from 'bun:test'
import { normalizeUiLocale } from './normalizeUiLocale'

describe('normalizeUiLocale', () => {
  it('returns "en" for "en"', () => {
    expect(normalizeUiLocale('en')).toBe('en')
  })

  it('returns "zh-CN" for anything else', () => {
    expect(normalizeUiLocale('zh-CN')).toBe('zh-CN')
    expect(normalizeUiLocale('fr')).toBe('zh-CN')
    expect(normalizeUiLocale(null)).toBe('zh-CN')
    expect(normalizeUiLocale(undefined)).toBe('zh-CN')
  })
})
