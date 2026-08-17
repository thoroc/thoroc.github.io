import { readColorThemePreference } from './readColorThemePreference'
import { resolveColorTheme } from './resolveColorTheme'
import type {
  StarsColorThemePreference,
  StarsResolvedColorTheme,
} from './types'

export const applyColorTheme = (
  preference: StarsColorThemePreference = readColorThemePreference(),
): StarsResolvedColorTheme => {
  if (typeof document === 'undefined') return resolveColorTheme(preference)
  const resolved = resolveColorTheme(preference)
  document.documentElement.dataset.starsTheme = resolved
  return resolved
}
