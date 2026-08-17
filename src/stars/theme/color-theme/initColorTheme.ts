import { applyColorTheme } from './applyColorTheme'
import type { StarsResolvedColorTheme } from './types'

export const initColorTheme = (): StarsResolvedColorTheme => {
  return applyColorTheme()
}
