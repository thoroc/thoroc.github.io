import { STARS_UI_PREFS_KEY } from './constants'
import type { StarsUiPrefs } from './types'

export const readRawPrefs = (): StarsUiPrefs => {
  try {
    const raw = localStorage.getItem(STARS_UI_PREFS_KEY)
    if (!raw) return {}
    const saved = JSON.parse(raw)
    return saved && typeof saved === 'object' ? saved : {}
  } catch {
    return {}
  }
}
