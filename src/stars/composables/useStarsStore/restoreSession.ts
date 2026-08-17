import { hasStarsFilterQuery } from './hasStarsFilterQuery'
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

interface StoredFilters {
  q?: string
  language?: string
  license?: string
  starredYear?: string
  type?: string
  sort?: string
}

export const restoreSession = (): void => {
  try {
    const raw = sessionStorage.getItem(STARS_FILTERS_SESSION_KEY)
    if (!raw || hasStarsFilterQuery()) return
    const saved: StoredFilters = JSON.parse(raw)
    if (saved.q) {
      qInput.value = saved.q
      qApplied.value = saved.q
    }
    if (saved.language) language.value = saved.language
    if (saved.license) license.value = saved.license
    if (saved.starredYear) starredYear.value = saved.starredYear
    if (saved.type) type.value = saved.type
    if (saved.sort) sort.value = saved.sort
  } catch {
    /* ignore */
  }
}
