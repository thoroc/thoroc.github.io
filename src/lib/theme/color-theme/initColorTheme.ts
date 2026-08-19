import { applyColorTheme } from './applyColorTheme'
import type { ResolvedColorTheme } from './types'

export const initColorTheme = (): ResolvedColorTheme => {
  return applyColorTheme()
}
