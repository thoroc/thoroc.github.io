import { normalizeUiLocale, resolveUiLocale } from '../../i18n'
import {
  readStoredGalaxyAreaExpanded,
  readStoredUiLocale,
  readStoredViewMode,
  writeStoredGalaxyAreaExpanded,
  writeStoredUiLocale,
  writeStoredViewMode,
} from '../../storage/ui-prefs'
import { mapLegacySort } from '../../utils/stars-filter'
import { isMobileViewport } from '../useMediaQuery'
import { hasGalaxyExpandQuery } from './hasGalaxyExpandQuery'
import { hasStarsViewQuery } from './hasStarsViewQuery'
import { hasUiLocaleQuery } from './hasUiLocaleQuery'
import {
  galaxyAreaExpanded,
  galaxyFocus,
  language,
  license,
  localeConfig,
  qApplied,
  qInput,
  sort,
  starredYear,
  type,
  uiLocale,
  viewMode,
} from './state'

export const applyQuery = (): void => {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams(window.location.search)

  if (hasUiLocaleQuery()) {
    uiLocale.value = resolveUiLocale(
      window.location.search,
      localeConfig.configured,
    )
    writeStoredUiLocale(uiLocale.value)
  } else {
    const storedLocale = readStoredUiLocale()
    uiLocale.value = storedLocale
      ? normalizeUiLocale(storedLocale)
      : resolveUiLocale('', localeConfig.configured)
  }

  if (params.has('stars-lang')) {
    language.value = params.get('stars-lang') || 'all'
  } else {
    language.value = 'all'
  }

  if (params.has('stars-license')) {
    license.value = params.get('stars-license') || 'all'
  } else {
    license.value = 'all'
  }

  if (params.has('stars-year')) {
    starredYear.value = params.get('stars-year') || 'all'
  } else {
    starredYear.value = 'all'
  }

  if (params.has('stars-q')) {
    const starsQ = params.get('stars-q') || ''
    qInput.value = starsQ
    qApplied.value = starsQ
  } else {
    qInput.value = ''
    qApplied.value = ''
  }

  if (params.has('stars-type')) {
    type.value = params.get('stars-type') || 'all'
  } else {
    type.value = 'all'
  }

  const starsSort = params.get('stars-sort')
  if (starsSort) {
    sort.value = mapLegacySort(starsSort)
  }

  const viewParam = params.get('stars-view')
  if (viewParam === 'galaxy') {
    viewMode.value = 'galaxy'
    writeStoredViewMode('galaxy')
  } else if (hasStarsViewQuery()) {
    viewMode.value = 'list'
    writeStoredViewMode('list')
  } else {
    const storedView = readStoredViewMode()
    viewMode.value = storedView === 'galaxy' ? 'galaxy' : 'list'
  }
  galaxyFocus.value = params.get('stars-focus') || ''

  const expandParam = params.get('stars-galaxy-expand')
  if (expandParam === '1' && !isMobileViewport()) {
    galaxyAreaExpanded.value = true
    writeStoredGalaxyAreaExpanded(true)
  } else if (hasGalaxyExpandQuery() || isMobileViewport()) {
    galaxyAreaExpanded.value = false
    writeStoredGalaxyAreaExpanded(false)
  } else {
    galaxyAreaExpanded.value = readStoredGalaxyAreaExpanded()
  }
}
