import { afterEach, describe, expect, it } from 'bun:test'
import { COLOR_THEME_KEY, LEGACY_STARS_COLOR_THEME_KEY } from './constants'
import { readColorThemePreference } from './readColorThemePreference'

describe('readColorThemePreference', () => {
  afterEach(() => {
    localStorage.removeItem(COLOR_THEME_KEY)
    localStorage.removeItem(LEGACY_STARS_COLOR_THEME_KEY)
  })

  it('defaults to "system" when nothing is stored', () => {
    expect(readColorThemePreference()).toBe('system')
  })

  it('returns a valid stored preference', () => {
    localStorage.setItem(COLOR_THEME_KEY, 'dark')
    expect(readColorThemePreference()).toBe('dark')
  })

  it('defaults to "system" for an invalid stored value', () => {
    localStorage.setItem(COLOR_THEME_KEY, 'blue')
    expect(readColorThemePreference()).toBe('system')
  })

  it('migrates a valid legacy stars-color-theme preference to the new key', () => {
    localStorage.setItem(LEGACY_STARS_COLOR_THEME_KEY, 'dark')
    expect(readColorThemePreference()).toBe('dark')
    expect(localStorage.getItem(COLOR_THEME_KEY)).toBe('dark')
  })

  it('ignores an invalid legacy value', () => {
    localStorage.setItem(LEGACY_STARS_COLOR_THEME_KEY, 'blue')
    expect(readColorThemePreference()).toBe('system')
    expect(localStorage.getItem(COLOR_THEME_KEY)).toBeNull()
  })

  it('prefers the new key over the legacy one when both are present', () => {
    localStorage.setItem(COLOR_THEME_KEY, 'light')
    localStorage.setItem(LEGACY_STARS_COLOR_THEME_KEY, 'dark')
    expect(readColorThemePreference()).toBe('light')
  })
})
