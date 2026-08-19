import { COLOR_THEME_KEY } from './constants'
import type { ColorThemePreference } from './types'

export const persistColorThemePreference = (
  preference: ColorThemePreference,
): void => {
  try {
    localStorage.setItem(COLOR_THEME_KEY, preference)
  } catch {
    /* ignore */
  }
}
