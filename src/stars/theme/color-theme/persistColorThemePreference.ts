import { STARS_COLOR_THEME_KEY } from './constants'
import type { StarsColorThemePreference } from './types'

export const persistColorThemePreference = (
  preference: StarsColorThemePreference,
): void => {
  try {
    localStorage.setItem(STARS_COLOR_THEME_KEY, preference)
  } catch {
    /* ignore */
  }
}
