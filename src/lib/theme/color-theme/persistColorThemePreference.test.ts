import { afterEach, describe, expect, it } from 'bun:test'
import { COLOR_THEME_KEY } from './constants'
import { persistColorThemePreference } from './persistColorThemePreference'

describe('persistColorThemePreference', () => {
  afterEach(() => {
    localStorage.removeItem(COLOR_THEME_KEY)
  })

  it('stores the preference for later reads', () => {
    persistColorThemePreference('dark')
    expect(localStorage.getItem(COLOR_THEME_KEY)).toBe('dark')
  })

  it('does not throw when localStorage.setItem fails', () => {
    const original = localStorage.setItem
    localStorage.setItem = () => {
      throw new Error('quota exceeded')
    }
    expect(() => persistColorThemePreference('light')).not.toThrow()
    localStorage.setItem = original
  })
})
