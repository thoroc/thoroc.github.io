import { currentPathname } from './currentPathname'
import { scrollListToTop } from './scrollListToTop'
import {
  language,
  license,
  qApplied,
  qInput,
  STARS_FILTERS_SESSION_KEY,
  sort,
  starredYear,
  type,
} from './state'

export const clearAllFilters = (): void => {
  qInput.value = ''
  qApplied.value = ''
  language.value = 'all'
  license.value = 'all'
  starredYear.value = 'all'
  type.value = 'all'
  sort.value = 'recently_starred'
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search)
    for (const key of [
      'stars-q',
      'stars-lang',
      'stars-license',
      'stars-year',
      'stars-type',
      'stars-sort',
    ]) {
      params.delete(key)
    }
    const qs = params.toString()
    window.history.replaceState(
      {},
      '',
      `${currentPathname()}${qs ? `?${qs}` : ''}`,
    )
  }
  try {
    sessionStorage.removeItem(STARS_FILTERS_SESSION_KEY)
  } catch {
    /* ignore */
  }
  scrollListToTop()
}
