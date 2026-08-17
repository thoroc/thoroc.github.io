import { describe, expect, it } from 'bun:test'
import { resolveUiLocale } from './resolveUiLocale'

describe('resolveUiLocale', () => {
  it('prefers the ?lang= query param when present', () => {
    expect(resolveUiLocale('?lang=en')).toBe('en')
  })

  it('normalizes an invalid ?lang= value', () => {
    expect(resolveUiLocale('?lang=fr')).toBe('zh-CN')
  })

  it('falls back to the fallback param when no query param', () => {
    expect(resolveUiLocale('', 'en')).toBe('en')
  })

  it('defaults the fallback to zh-CN', () => {
    expect(resolveUiLocale('')).toBe('zh-CN')
  })
})
