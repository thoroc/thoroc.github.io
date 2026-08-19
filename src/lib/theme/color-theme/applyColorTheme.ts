import { readColorThemePreference } from './readColorThemePreference'
import { resolveColorTheme } from './resolveColorTheme'
import type { ColorThemePreference, ResolvedColorTheme } from './types'

export const applyColorTheme = (
  preference: ColorThemePreference = readColorThemePreference(),
): ResolvedColorTheme => {
  if (typeof document === 'undefined') return resolveColorTheme(preference)
  const resolved = resolveColorTheme(preference)
  document.documentElement.dataset.theme = resolved
  return resolved
}
