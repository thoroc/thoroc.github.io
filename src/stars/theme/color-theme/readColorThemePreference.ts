import { STARS_COLOR_THEME_KEY } from './constants'
import type { StarsColorThemePreference } from './types'

export const readColorThemePreference = (): StarsColorThemePreference => {
  try {
    const value = localStorage.getItem(STARS_COLOR_THEME_KEY)
    if (value === 'light' || value === 'dark' || value === 'system')
      return value
  } catch {
    /* ignore */
  }
  return 'system'
}
