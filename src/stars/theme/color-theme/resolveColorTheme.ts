import { readColorThemePreference } from './readColorThemePreference'
import type {
  StarsColorThemePreference,
  StarsResolvedColorTheme,
} from './types'

export const resolveColorTheme = (
  preference: StarsColorThemePreference = readColorThemePreference(),
): StarsResolvedColorTheme => {
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
