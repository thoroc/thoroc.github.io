import { STARS_UI_PREFS_KEY } from './constants'
import { readRawPrefs } from './readRawPrefs'
import type { StarsUiPrefs } from './types'

export const writeUiPrefs = (patch: Partial<StarsUiPrefs>): void => {
  try {
    const next = { ...readRawPrefs(), ...patch }
    localStorage.setItem(STARS_UI_PREFS_KEY, JSON.stringify(next))
  } catch {
    /* ignore */
  }
}
