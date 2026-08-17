import { reactive } from 'vue'
import { applyQuery } from './applyQuery'
import { bootstrap } from './bootstrap'
import { clearAllFilters } from './clearAllFilters'
import { clearFilterKey } from './clearFilterKey'
import { closeGalaxyDetail } from './closeGalaxyDetail'
import { collapseDescExpanded } from './collapseDescExpanded'
import {
  filtered,
  galaxyLayout,
  galaxyVirtualIndexMap,
  generatedAt,
  hasActiveFilters,
  items,
  languageOptions,
  licenseOptions,
  owner,
  pageTitle,
  repoName,
  stats,
  total,
  yearOptions,
} from './computed'
import { ensureGalaxyLayout } from './ensureGalaxyLayout'
import { isDescExpanded } from './isDescExpanded'
import { onPopState } from './onPopState'
import { onSearch } from './onSearch'
import { patchLanguageInQuery } from './patchLanguageInQuery'
import { patchLicenseInQuery } from './patchLicenseInQuery'
import { patchStarredYearInQuery } from './patchStarredYearInQuery'
import { scrollListToTop } from './scrollListToTop'
import { selectGalaxyItem } from './selectGalaxyItem'
import { setGalaxyAreaExpanded } from './setGalaxyAreaExpanded'
import { setGalaxyRenderStats } from './setGalaxyRenderStats'
import { setUiLocale } from './setUiLocale'
import { setViewMode } from './setViewMode'
import {
  error,
  galaxyAreaExpanded,
  galaxyFocus,
  galaxyRenderStats,
  galaxySelected,
  language,
  license,
  loading,
  payload,
  qApplied,
  qInput,
  showLanguage,
  showLicense,
  showStarsCount,
  siteMeta,
  sort,
  starredYear,
  type,
  uiLocale,
  viewMode,
  virtualRowHeight,
} from './state'
import { toggleDescExpanded } from './toggleDescExpanded'
import { toggleGalaxyAreaExpanded } from './toggleGalaxyAreaExpanded'
import type { StarsStore } from './types'
// Side-effect import: registers the module-scope search/filter watchers
// exactly once, the first time this module loads (see watchers.ts).
import './watchers'

export const useStarsStore = (): StarsStore => {
  const store = reactive({
    uiLocale,
    loading,
    error,
    payload,
    siteMeta,
    qInput,
    qApplied,
    language,
    license,
    starredYear,
    type,
    sort,
    galaxyRenderStats,
    setGalaxyRenderStats,
    showLanguage,
    showStarsCount,
    showLicense,
    virtualRowHeight,
    viewMode,
    galaxyFocus,
    galaxySelected,
    galaxyAreaExpanded,
    setViewMode,
    setGalaxyAreaExpanded,
    toggleGalaxyAreaExpanded,
    ensureGalaxyLayout,
    selectGalaxyItem,
    closeGalaxyDetail,
    bootstrap,
    onSearch,
    onPopState,
    applyQuery,
    scrollListToTop,
    setUiLocale,
    patchLanguageInQuery,
    patchLicenseInQuery,
    patchStarredYearInQuery,
    clearAllFilters,
    clearFilterKey,
    isDescExpanded,
    toggleDescExpanded,
    collapseDescExpanded,
  })

  Object.defineProperties(store, {
    items: { get: () => items.value },
    total: { get: () => total.value },
    owner: { get: () => owner.value },
    repoName: { get: () => repoName.value },
    generatedAt: { get: () => generatedAt.value },
    pageTitle: { get: () => pageTitle.value },
    stats: { get: () => stats.value },
    galaxyLayout: { get: () => galaxyLayout.value },
    galaxyVirtualIndexMap: { get: () => galaxyVirtualIndexMap.value },
    licenseOptions: { get: () => licenseOptions.value },
    yearOptions: { get: () => yearOptions.value },
    languageOptions: { get: () => languageOptions.value },
    filtered: { get: () => filtered.value },
    hasActiveFilters: { get: () => hasActiveFilters.value },
  })

  // `reactive()`'s inferred type only reflects the initial object literal;
  // the computed-backed getters added afterward via Object.defineProperties
  // are genuinely absent from that type, so a single-step `as StarsStore`
  // is rejected by TypeScript itself — the `unknown` intermediary is
  // required here, not a hidden-any workaround. See the equivalent
  // documented case in galaxy/nebula-volume/createNebulaVolumeMesh.ts.
  return store as unknown as StarsStore
}
