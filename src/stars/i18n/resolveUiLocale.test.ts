import { describe, expect, it } from 'bun:test'
import { resolveUiLocale } from './resolveUiLocale'

describe('resolveUiLocale', () => {
  it('prefers the ?lang= query param when present', () => {
    expect(resolveUiLocale('?lang=en')).toBe('en')
  })

  it('normalizes an invalid ?lang= value', () => {
    expect(resolveUiLocale('?lang=zh-CN')).toBe('fr')
  })

  it('falls back to the fallback param when no query param', () => {
    expect(resolveUiLocale('', 'fr')).toBe('fr')
  })

  it('defaults the fallback to en', () => {
    expect(resolveUiLocale('')).toBe('en')
  })
})
