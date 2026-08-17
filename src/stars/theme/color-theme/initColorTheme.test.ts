import { afterEach, describe, expect, it } from 'bun:test'
import { STARS_COLOR_THEME_KEY } from './constants'
import { initColorTheme } from './initColorTheme'

describe('initColorTheme', () => {
  afterEach(() => {
    localStorage.removeItem(STARS_COLOR_THEME_KEY)
  })

  it('applies the theme resolved from the stored preference', () => {
    localStorage.setItem(STARS_COLOR_THEME_KEY, 'dark')
    expect(initColorTheme()).toBe('dark')
    expect(document.documentElement.dataset.starsTheme).toBe('dark')
  })
})
