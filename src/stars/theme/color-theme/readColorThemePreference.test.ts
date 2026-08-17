import { afterEach, describe, expect, it } from 'bun:test'
import { STARS_COLOR_THEME_KEY } from './constants'
import { readColorThemePreference } from './readColorThemePreference'

describe('readColorThemePreference', () => {
  afterEach(() => {
    localStorage.removeItem(STARS_COLOR_THEME_KEY)
  })

  it('defaults to "system" when nothing is stored', () => {
    expect(readColorThemePreference()).toBe('system')
  })

  it('returns a valid stored preference', () => {
    localStorage.setItem(STARS_COLOR_THEME_KEY, 'dark')
    expect(readColorThemePreference()).toBe('dark')
  })

  it('defaults to "system" for an invalid stored value', () => {
    localStorage.setItem(STARS_COLOR_THEME_KEY, 'blue')
    expect(readColorThemePreference()).toBe('system')
  })
})
