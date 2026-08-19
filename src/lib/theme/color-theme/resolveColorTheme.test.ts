import { describe, expect, it } from 'bun:test'
import { resolveColorTheme } from './resolveColorTheme'

describe('resolveColorTheme', () => {
  it('returns "light" for an explicit light preference', () => {
    expect(resolveColorTheme('light')).toBe('light')
  })

  it('returns "dark" for an explicit dark preference', () => {
    expect(resolveColorTheme('dark')).toBe('dark')
  })

  it('falls back to the media query for "system"', () => {
    const result = resolveColorTheme('system')
    expect(['light', 'dark']).toContain(result)
  })

  it('returns "dark" when the media query reports a dark preference', () => {
    const original = window.matchMedia
    window.matchMedia = ((query: string) =>
      ({
        matches: true,
        media: query,
      }) as MediaQueryList) as typeof window.matchMedia
    expect(resolveColorTheme('system')).toBe('dark')
    window.matchMedia = original
  })

  it('returns "light" when the media query reports a light preference', () => {
    const original = window.matchMedia
    window.matchMedia = ((query: string) =>
      ({
        matches: false,
        media: query,
      }) as MediaQueryList) as typeof window.matchMedia
    expect(resolveColorTheme('system')).toBe('light')
    window.matchMedia = original
  })
})
