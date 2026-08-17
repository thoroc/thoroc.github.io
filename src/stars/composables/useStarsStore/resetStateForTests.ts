import {
  bootstrapState,
  debounceState,
  error,
  expandedDescIds,
  galaxyAreaExpanded,
  galaxyFocus,
  galaxyLayoutPayload,
  galaxyLayoutState,
  galaxyRenderStats,
  galaxySelected,
  language,
  license,
  loading,
  localeConfig,
  payload,
  qApplied,
  qInput,
  rowRemeasureController,
  scrollController,
  searchConfig,
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

/** Test-only helper: this module's state is a set of shared, module-scope
 * singletons (matching the original file's design) — every test file that
 * mutates it must reset it in an afterEach, or state leaks across test
 * files sharing the same module cache. Not part of the production barrel. */
export const resetStateForTests = (): void => {
  payload.value = null
  siteMeta.value = null
  loading.value = true
  error.value = ''
  qInput.value = ''
  qApplied.value = ''
  language.value = 'all'
  license.value = 'all'
  starredYear.value = 'all'
  type.value = 'all'
  sort.value = 'recently_starred'
  uiLocale.value = 'zh-CN'
  showLanguage.value = true
  showStarsCount.value = true
  showLicense.value = true
  virtualRowHeight.value = 140
  expandedDescIds.value = new Set()
  viewMode.value = 'list'
  galaxyFocus.value = ''
  galaxySelected.value = null
  galaxyAreaExpanded.value = false
  galaxyLayoutPayload.value = null
  galaxyRenderStats.value = {
    layoutVersion: 0,
    pointCount: 0,
    precomputed: false,
  }

  scrollController.fn = () => undefined
  rowRemeasureController.fn = () => undefined
  clearTimeout(debounceState.timer)
  debounceState.timer = undefined
  searchConfig.debounceMs = 300
  localeConfig.configured = 'zh-CN'
  galaxyLayoutState.promise = null
  bootstrapState.promise = null

  if (typeof window !== 'undefined') {
    window.history.replaceState({}, '', '/')
  }
  try {
    sessionStorage.clear()
  } catch {
    /* ignore */
  }
  try {
    localStorage.clear()
  } catch {
    /* ignore */
  }
}
