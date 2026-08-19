import { COLOR_THEME_KEY, LEGACY_STARS_COLOR_THEME_KEY } from './constants'
import type { ColorThemePreference } from './types'

const isValidPreference = (value: unknown): value is ColorThemePreference =>
  value === 'light' || value === 'dark' || value === 'system'

export const readColorThemePreference = (): ColorThemePreference => {
  try {
    const value = localStorage.getItem(COLOR_THEME_KEY)
    if (isValidPreference(value)) return value

    const legacyValue = localStorage.getItem(LEGACY_STARS_COLOR_THEME_KEY)
    if (isValidPreference(legacyValue)) {
      localStorage.setItem(COLOR_THEME_KEY, legacyValue)
      return legacyValue
    }
  } catch {
    /* ignore */
  }
  return 'system'
}
