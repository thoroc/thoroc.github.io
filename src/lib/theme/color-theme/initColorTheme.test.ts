import { afterEach, describe, expect, it } from 'bun:test'
import { COLOR_THEME_KEY } from './constants'
import { initColorTheme } from './initColorTheme'

describe('initColorTheme', () => {
  afterEach(() => {
    localStorage.removeItem(COLOR_THEME_KEY)
  })

  it('applies the theme resolved from the stored preference', () => {
    localStorage.setItem(COLOR_THEME_KEY, 'dark')
    expect(initColorTheme()).toBe('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
  })
})
