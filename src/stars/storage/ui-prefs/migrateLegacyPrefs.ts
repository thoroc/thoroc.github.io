import { LEGACY_FILTERS_KEY, LEGACY_SIDEBAR_KEY } from './constants'
import type { StarsUiPrefs } from './types'

export const migrateLegacyPrefs = (prefs: StarsUiPrefs): StarsUiPrefs => {
  if (prefs.sidebarCollapsed == null) {
    try {
      if (sessionStorage.getItem(LEGACY_SIDEBAR_KEY) === '1') {
        prefs.sidebarCollapsed = true
      }
    } catch {
      /* ignore */
    }
  }

  if (!prefs.uiLocale || !prefs.viewMode) {
    try {
      const raw = sessionStorage.getItem(LEGACY_FILTERS_KEY)
      if (raw) {
        const saved = JSON.parse(raw)
        if (!prefs.uiLocale && saved?.uiLocale) prefs.uiLocale = saved.uiLocale
        if (!prefs.viewMode && saved?.viewMode) prefs.viewMode = saved.viewMode
      }
    } catch {
      /* ignore */
    }
  }

  return prefs
}
