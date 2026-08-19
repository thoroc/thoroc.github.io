import { readColorThemePreference } from './readColorThemePreference'
import type { ColorThemePreference, ResolvedColorTheme } from './types'

export const resolveColorTheme = (
  preference: ColorThemePreference = readColorThemePreference(),
): ResolvedColorTheme => {
  if (preference === 'light') return 'light'
  if (preference === 'dark') return 'dark'
  if (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark'
  }
  return 'light'
}
