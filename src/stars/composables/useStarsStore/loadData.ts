import { STARS_DATA_BASE } from '../../config'
import { normalizeUiLocale } from '../../i18n'
import { mapLegacySort } from '../../utils/stars-filter'
import {
  error,
  localeConfig,
  payload,
  searchConfig,
  showLanguage,
  showLicense,
  showStarsCount,
  sort,
  virtualRowHeight,
} from './state'

export const loadData = async (): Promise<void> => {
  error.value = ''
  try {
    const base = STARS_DATA_BASE
    const res = await fetch(`${base}stars.json`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    payload.value = await res.json()
    const ui = payload.value?.ui || {}
    showLanguage.value = ui.showLanguage !== false
    showStarsCount.value = ui.showStarsCount !== false
    showLicense.value = ui.showLicense !== false
    virtualRowHeight.value = ui.virtualRowHeight || 140
    if (ui.defaultSort) sort.value = mapLegacySort(ui.defaultSort)
    if (ui.defaultUiLocale)
      localeConfig.configured = normalizeUiLocale(ui.defaultUiLocale)
    if (ui.searchDebounceMs) searchConfig.debounceMs = ui.searchDebounceMs
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Error'
  }
}
